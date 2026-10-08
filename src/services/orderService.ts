import { Order, OrderStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const getInitialOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('ferre_orders_cache_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
  }
  return [];
};

let localOrdersStore: Order[] = getInitialOrders();

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Order[];
      } catch (e) {
        console.warn('Supabase fetch orders failed, using local orders store.', e);
      }
    }
    return localOrdersStore;
  },

  async createOrder(
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>,
    couponCode?: string
  ): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: `FI-${Math.floor(Math.random() * 90000 + 10000)}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        // 1. Intentar Checkout Atómico con RPC process_checkout (PostgreSQL)
        const cartPayload = newOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));

        const { data: rpcData, error: rpcError } = await supabase.rpc('process_checkout', {
          p_profile_id: newOrder.user_id || null,
          p_items: cartPayload,
          p_coupon_code: couponCode || null,
          p_shipping_address: newOrder.shipping_address,
          p_customer_notes: newOrder.notes || null
        });

        if (!rpcError && rpcData?.success) {
          const finalOrder = {
            ...newOrder,
            id: rpcData.order_id || newOrder.id,
            order_number: rpcData.order_number || newOrder.order_number,
            total: rpcData.total_amount !== undefined ? Number(rpcData.total_amount) : newOrder.total
          };
          localOrdersStore.unshift(finalOrder);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ferre_orders_cache_v1', JSON.stringify(localOrdersStore));
            } catch (_) {}
          }
          return finalOrder;
        }

        // Si el RPC devolvió un error de validación de negocio (ej. falta de stock o cupón inválido)
        if (rpcError && (rpcError.message.includes('Stock') || rpcError.message.includes('cupón') || rpcError.code === 'P0001')) {
          throw new Error(rpcError.message);
        }

        // 2. Fallback de inserción directa si el RPC aún no fue creado en Supabase
        const { data, error } = await supabase.from('orders').insert({
          order_number: newOrder.order_number,
          user_id: newOrder.user_id || null,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          shipping_address: newOrder.shipping_address,
          payment_method: newOrder.payment_method,
          status: newOrder.status,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          tax: newOrder.tax,
          shipping_cost: newOrder.shipping_cost,
          total: newOrder.total,
          notes: newOrder.notes
        }).select().single();

        if (!error && data) {
          const orderItemsToInsert = newOrder.items.map(item => ({
            order_id: data.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal
          }));
          await supabase.from('order_items').insert(orderItemsToInsert);
          const finalOrder = { ...newOrder, id: data.id };
          localOrdersStore.unshift(finalOrder);
          return finalOrder;
        }
      } catch (e: any) {
        if (e.message && (e.message.includes('Stock') || e.message.includes('cupón'))) {
          throw e; // Propagar error de negocio al usuario
        }
        console.warn('Supabase checkout fallback a almacenamiento local:', e);
      }
    }

    localOrdersStore.unshift(newOrder);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ferre_orders_cache_v1', JSON.stringify(localOrdersStore));
      } catch (_) {}
    }
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      } catch (e) {
        console.warn('Supabase update order status error', e);
      }
    }
    const order = localOrdersStore.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }
};
