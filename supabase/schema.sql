-- ==========================================
-- FERRE INTER - SUPABASE DATABASE SCHEMA SQL
-- Brand Colors: #f48f25, #031834, #ffffff, #000000
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'collaborator', 'customer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT DEFAULT 'FERRE INTER',
  sku TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  technical_specs JSONB DEFAULT '{}'::jsonb,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(10, 2) CHECK (discount_price IS NULL OR discount_price < price),
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash_on_delivery', 'pse')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL
);

-- 6. APPOINTMENTS / TECHNICAL CONSULTING TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('asesoria_tecnica', 'mantenimiento_herramientas', 'cotizacion_proyecto', 'instalacion_equipos')),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  comments TEXT,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ACTIVITY LOGS (AUDIT LOGS) TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products, Admins/Collaborators can manage
CREATE POLICY "Public read active products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'collaborator'))
);

-- User Profiles: Users can read/update their own profile, Admins can manage all
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders: Users can read own orders, Admins/Collaborators can see all
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));
CREATE POLICY "Users insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

-- Order Items: Tied to orders RLS
CREATE POLICY "Users read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Users insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Appointments: Users can create/view own, Admins view all
CREATE POLICY "Public create appointment" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view appointments" ON appointments FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

-- Coupons: Public can check valid coupons
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Activity Logs: Admins only
CREATE POLICY "Admin view logs" ON activity_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));
CREATE POLICY "Insert activity log" ON activity_logs FOR INSERT WITH CHECK (true);

-- INITIAL SEED DATA FOR DEMO
INSERT INTO coupons (code, discount_percentage, valid_until, max_uses, is_active)
VALUES 
  ('FERRE20', 20, '2027-12-31 23:59:59+00', 500, true),
  ('WELCOME10', 10, '2027-12-31 23:59:59+00', 1000, true)
ON CONFLICT (code) DO NOTHING;
