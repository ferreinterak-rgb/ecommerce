export type UserRole = 'admin' | 'collaborator' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  description: string;
  technical_specs?: Record<string, string>;
  price: number;
  discount_price?: number | null;
  wholesale_price?: number | null;
  category: string;
  stock: number;
  stock_warehouse?: number | null;
  stock_store?: number | null;
  stock_online?: number | null;
  warranty?: string | null;
  dimensions?: string | null;
  materials?: string | null;
  inventory_status?: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedVariant?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  notes?: string;
}

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery' | 'pse';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_cost: number;
  total: number;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type ServiceType = 'cotizacion_volumen' | 'asesoria_comercial' | 'ventas_corporativas' | 'soporte_envios';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  user_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: ServiceType;
  preferred_date: string;
  preferred_time: string;
  status: AppointmentStatus;
  comments?: string;
  assigned_to?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  valid_until: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}
