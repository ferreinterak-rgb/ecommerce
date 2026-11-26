import { Order, OrderItem, OrderStatus, ShippingAddress } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ORDERS_CACHE_KEY = 'ferre_orders_cache_v1';

const getInitialOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(ORDERS_CACHE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
  }
  return [];
};

let localOrdersStore: Order[] = getInitialOrders();

const saveLocalOrders = (orders: Order[]) => {
  localOrdersStore = orders;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(localOrdersStore));
    } catch (_) {}
  }
};

/**
 * Normaliza una fila de public.orders + public.order_items de Supabase a la interfaz Order del frontend
 */
const normalizeSupabaseOrder = (row: any): Order => {
  const addrObj: Record<string, any> =
    row.shipping_address && typeof row.shipping_address === 'object'
      ? row.shipping_address
      : { address: String(row.shipping_address || '') };

  const shippingAddress: ShippingAddress = {
    fullName: addrObj.fullName || addrObj.customer_name || row.customer_name || 'Cliente FERREINTER',
    address: addrObj.address || '',
    city: addrObj.city || 'Colombia',
    state: addrObj.state || '',
    zipCode: addrObj.zipCode || '',
    phone: addrObj.phone || addrObj.customer_phone || row.customer_phone || '',
    notes: addrObj.notes || row.customer_notes || '',
    documentType: addrObj.documentType || row.customer_document_type || 'CC',
    documentId: addrObj.documentId || row.customer_document_id || ''
  };

  const rawItems = Array.isArray(row.items) ? row.items : [];
  const normalizedItems: OrderItem[] = rawItems.map((it: any, idx: number) => ({
    id: String(it.id || `oi-${row.id}-${idx}`),
    order_id: String(it.order_id || row.id),
    product_id: String(it.product_id || ''),
    product_name: String(it.product_name || 'Producto FERREINTER'),
    product_sku: String(it.product_sku || ''),
    price: Number(it.unit_price ?? it.price ?? 0),
    quantity: Number(it.quantity ?? 1),
    subtotal: Number(it.total_price ?? it.subtotal ?? 0)
  }));

  const subtotal = Number(row.subtotal ?? 0);
  const discount = Number(row.discount_applied ?? row.discount ?? 0);
  const tax = Number(addrObj.tax ?? row.tax ?? Math.round(Math.max(0, subtotal - discount) * 0.19));
  const shippingCost = Number(addrObj.shipping_cost ?? row.shipping_cost ?? 0);
  const total = Number(
    addrObj.total_with_tax_and_shipping ??
      row.total ??
      row.total_amount ??
      Math.max(0, subtotal - discount) + tax + shippingCost
  );

  return {
    id: String(row.id),
    order_number: String(row.order_number || row.order_ref || `FI-${String(row.id).slice(0, 6)}`),
    user_id: row.profile_id || row.user_id || undefined,
    customer_name: String(
      row.customer_name || addrObj.customer_name || addrObj.fullName || 'Cliente FERREINTER'
    ),
    customer_email: String(row.customer_email || addrObj.customer_email || ''),
    customer_phone: String(row.customer_phone || addrObj.customer_phone || addrObj.phone || ''),
    customer_document_type: addrObj.documentType || row.customer_document_type || 'CC',
    customer_document_id: addrObj.documentId || row.customer_document_id || '',
    shipping_address: shippingAddress,
    payment_method: addrObj.payment_method || row.payment_method || 'mercadopago',
    status: (row.status as OrderStatus) || 'pending',
    subtotal,
    discount,
    tax,
    shipping_cost: shippingCost,
    total,
    items: normalizedItems,
    notes: row.customer_notes || row.notes || shippingAddress.notes,
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : undefined
  };
};

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const normalized = data.map(normalizeSupabaseOrder);
          // Combinar con pedidos en cache local que aún no estén en la lista (por ejemplo si se consulta sin sesión admin)
          const dbOrderNumbers = new Set(normalized.map(o => o.order_number));
          const merged = [
            ...normalized,
            ...localOrdersStore.filter(o => !dbOrderNumbers.has(o.order_number))
          ];
          saveLocalOrders(merged);
          return merged;
        }
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

    const enrichedShippingAddress = {
      ...(typeof newOrder.shipping_address === 'object'
        ? newOrder.shipping_address
        : { address: String(newOrder.shipping_address) }),
      fullName: newOrder.customer_name,
      customer_name: newOrder.customer_name,
      customer_email: newOrder.customer_email,
      customer_phone: newOrder.customer_phone,
      documentType: newOrder.customer_document_type || newOrder.shipping_address?.documentType || 'CC',
      documentId: newOrder.customer_document_id || newOrder.shipping_address?.documentId || '',
      payment_method: newOrder.payment_method || 'mercadopago',
      payment_gateway: 'mercadopago',
      tax: newOrder.tax,
      shipping_cost: newOrder.shipping_cost,
      total_with_tax_and_shipping: newOrder.total
    };

    if (isSupabaseConfigured()) {
      try {
        // 1. Checkout Transaccional Atómico con RPC process_checkout (PostgreSQL SECURITY DEFINER)
        const cartPayload = newOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));

        const { data: rpcData, error: rpcError } = await supabase.rpc('process_checkout', {
          p_profile_id: newOrder.user_id || null,
          p_items: cartPayload,
          p_coupon_code: couponCode || null,
          p_shipping_address: enrichedShippingAddress,
          p_customer_notes:
            newOrder.notes ||
            `Cliente: ${newOrder.customer_name} (${enrichedShippingAddress.documentType} ${enrichedShippingAddress.documentId}) - Tel: ${newOrder.customer_phone} - Email: ${newOrder.customer_email}`
        });

        if (!rpcError && rpcData?.success) {
          const finalOrder: Order = {
            ...newOrder,
            id: rpcData.order_id || newOrder.id,
            order_number: rpcData.order_number || newOrder.order_number,
            total: newOrder.total
          };
          saveLocalOrders([finalOrder, ...localOrdersStore.filter(o => o.order_number !== finalOrder.order_number)]);
          return finalOrder;
        }

        // Si el RPC devolvió un error de validación de negocio (ej. falta de stock o cupón inválido)
        if (rpcError && (rpcError.message.includes('Stock') || rpcError.message.includes('cupón') || rpcError.code === 'P0001')) {
          throw new Error(rpcError.message);
        }

        // 2. Fallback: Inserción directa con las columnas exactas de public.orders en Supabase
        const { data, error } = await supabase
          .from('orders')
          .insert({
            order_number: newOrder.order_number,
            profile_id: newOrder.user_id || null,
            status: newOrder.status || 'pending',
            subtotal: newOrder.subtotal,
            discount_applied: newOrder.discount || 0,
            total_amount: newOrder.total,
            invoice_status: 'pending',
            payment_status: 'pending',
            shipping_address: enrichedShippingAddress,
            customer_notes:
              newOrder.notes ||
              `Cliente: ${newOrder.customer_name} (${enrichedShippingAddress.documentType} ${enrichedShippingAddress.documentId})`
          })
          .select()
          .single();

        if (!error && data) {
          try {
            const orderItemsToInsert = newOrder.items.map(item => ({
              order_id: data.id,
              product_id: item.product_id,
              product_name: item.product_name,
              product_sku: item.product_sku,
              unit_price: item.price,
              quantity: item.quantity,
              total_price: item.subtotal
            }));
            await supabase.from('order_items').insert(orderItemsToInsert);
          } catch (_) {}

          const finalOrder: Order = { ...newOrder, id: data.id };
          saveLocalOrders([finalOrder, ...localOrdersStore.filter(o => o.order_number !== finalOrder.order_number)]);
          return finalOrder;
        }
      } catch (e: any) {
        if (e.message && (e.message.includes('Stock') || e.message.includes('cupón'))) {
          throw e;
        }
        console.warn('Supabase checkout fallback a almacenamiento local:', e);
      }
    }

    saveLocalOrders([newOrder, ...localOrdersStore]);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (e) {
        console.warn('Supabase update order status error', e);
      }
    }
    const order = localOrdersStore.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      saveLocalOrders([...localOrdersStore]);
      return true;
    }
    return false;
  },

  async updateOrderPaymentByNumber(
    orderNumber: string,
    mpStatus: 'approved' | 'pending' | 'rejected',
    paymentId?: string | null
  ): Promise<boolean> {
    const orderStatus: OrderStatus =
      mpStatus === 'approved' ? 'processing' : mpStatus === 'rejected' ? 'cancelled' : 'pending';
    // Columna payment_status en public.orders tiene CHECK ('pending', 'partial_payment', 'paid_in_full')
    const paymentStatus = mpStatus === 'approved' ? 'paid_in_full' : 'pending';

    if (isSupabaseConfigured()) {
      try {
        const updatePayload: Record<string, any> = {
          status: orderStatus,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        };
        if (paymentId && paymentId !== 'null') {
          updatePayload.invoice_external_id = `MP-${paymentId}`;
        }
        await supabase.from('orders').update(updatePayload).eq('order_number', orderNumber);
      } catch (e) {
        console.warn('Supabase update payment status error', e);
      }
    }

    const order = localOrdersStore.find(o => o.order_number === orderNumber);
    if (order) {
      order.status = orderStatus;
      order.updated_at = new Date().toISOString();
      saveLocalOrders([...localOrdersStore]);
      return true;
    }
    return false;
  }
};
