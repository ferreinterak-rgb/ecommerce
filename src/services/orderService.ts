import { Order, OrderStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'FI-89210',
    customer_name: 'Carlos Mendoza',
    customer_email: 'carlos.mendoza@constructora-andina.com',
    customer_phone: '+57 310 456 7890',
    shipping_address: {
      fullName: 'Carlos Mendoza',
      address: 'Av. Industrial 45-20, Zona Franca',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110911',
      phone: '+57 310 456 7890',
      notes: 'Entregar en el almacén central de la obra'
    },
    payment_method: 'credit_card',
    status: 'pending',
    subtotal: 398.00,
    discount: 39.80,
    tax: 68.05,
    shipping_cost: 0,
    total: 426.25,
    items: [
      {
        id: 'oi-1',
        product_id: 'p-1',
        product_name: 'Taladro Percutor Inalámbrico DeWalt 20V Max XR Brushless',
        product_sku: 'DCD996B-20V',
        price: 199.00,
        quantity: 2,
        subtotal: 398.00
      }
    ],
    notes: 'Solicita factura electrónica con NIT 900.458.129-4',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord-1002',
    order_number: 'FI-89211',
    customer_name: 'Ingrid Morales',
    customer_email: 'imorales@diseno-interiores.co',
    customer_phone: '+57 315 789 1234',
    shipping_address: {
      fullName: 'Ingrid Morales',
      address: 'Calle 93B # 13-45 Apto 502',
      city: 'Medellín',
      state: 'Antioquia',
      zipCode: '050021',
      phone: '+57 315 789 1234'
    },
    payment_method: 'pse',
    status: 'processing',
    subtotal: 123.99,
    discount: 0,
    tax: 23.55,
    shipping_cost: 15.00,
    total: 162.54,
    items: [
      {
        id: 'oi-2',
        product_id: 'p-2',
        product_name: 'Cinta Métrica Stanley PowerLock 25ft',
        product_sku: 'ST-33-425',
        price: 24.99,
        quantity: 1,
        subtotal: 24.99
      },
      {
        id: 'oi-3',
        product_id: 'p-4',
        product_name: 'Juego de Llaves Mixtas Craftsman 20 Piezas',
        product_sku: 'CMMT12034',
        price: 89.99,
        quantity: 1,
        subtotal: 89.99
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'ord-1003',
    order_number: 'FI-89212',
    customer_name: 'Ferretería El Progreso',
    customer_email: 'compras@ferreteriaelprogreso.com',
    customer_phone: '+57 300 234 5678',
    shipping_address: {
      fullName: 'Jorge Ramirez',
      address: 'Carrera 15 # 8-32 Centro',
      city: 'Cali',
      state: 'Valle del Cauca',
      zipCode: '760001',
      phone: '+57 300 234 5678'
    },
    payment_method: 'bank_transfer',
    status: 'shipped',
    subtotal: 645.00,
    discount: 64.50,
    tax: 110.29,
    shipping_cost: 0,
    total: 690.79,
    items: [
      {
        id: 'oi-4',
        product_id: 'p-5',
        product_name: 'Escalera de Tijera de Aluminio Werner 6 ft.',
        product_sku: 'WERN-6FT-AL',
        price: 129.00,
        quantity: 5,
        subtotal: 645.00
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'ord-1004',
    order_number: 'FI-89213',
    customer_name: 'Roberto Gómez',
    customer_email: 'roberto.gomez@gmail.com',
    customer_phone: '+57 318 901 2345',
    shipping_address: {
      fullName: 'Roberto Gómez',
      address: 'Transversal 44 # 78-12',
      city: 'Barranquilla',
      state: 'Atlántico',
      zipCode: '080001',
      phone: '+57 318 901 2345'
    },
    payment_method: 'cash_on_delivery',
    status: 'delivered',
    subtotal: 219.99,
    discount: 20.00,
    tax: 37.99,
    shipping_cost: 0,
    total: 237.98,
    items: [
      {
        id: 'oi-5',
        product_id: 'p-6',
        product_name: 'Cerradura Digital de Alta Seguridad Yale',
        product_sku: 'YALE-YRD226',
        price: 219.99,
        quantity: 1,
        subtotal: 219.99
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 96).toISOString()
  }
];

let localOrdersStore: Order[] = [...MOCK_ORDERS];

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
