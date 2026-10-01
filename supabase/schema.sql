-- ============================================================================
-- FERRE INTER - ESQUEMA DE BASE DE DATOS E-COMMERCE ARQUITECTURA ROBUSUTA (FASE 3)
-- Fuente de Verdad: Supabase / PostgreSQL
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLA DE PERFILES DE USUARIO (profiles)
-- Relacionada 1 a 1 con auth.users. Contiene datos de Facturación Electrónica DIAN.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  document_type TEXT CHECK (document_type IN ('CC', 'NIT', 'CE', 'PASAPORTE', 'TI', 'RUT')),
  document_number TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'collaborator', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. TABLA DE PRODUCTOS E INVENTARIO (products)
-- Basado en las especificaciones del Packing List real de importaciones.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  brand TEXT DEFAULT 'FERRE INTER',
  category TEXT NOT NULL DEFAULT 'General',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12, 2) CHECK (discount_price IS NULL OR discount_price < price),
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  
  -- Especificaciones de empaque y volumen del Packing List
  length_mm NUMERIC(10, 2),
  width_mm NUMERIC(10, 2),
  height_mm NUMERIC(10, 2),
  package_details TEXT,
  color TEXT,
  cbm_pc NUMERIC(10, 6),
  gross_weight_kg NUMERIC(10, 3),
  net_weight_kg NUMERIC(10, 3),
  
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. TABLA DE CUPONES DE DESCUENTO (coupons)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  max_uses INT DEFAULT 100,
  current_uses INT NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. TABLA DE PEDIDOS (orders)
-- Soporta Facturación Electrónica DIAN y estado de abonos/pagos.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_applied NUMERIC(12, 2) DEFAULT 0 CHECK (discount_applied >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  
  -- Campos para Facturación Electrónica DIAN
  invoice_status TEXT NOT NULL DEFAULT 'pending' CHECK (invoice_status IN ('pending', 'generated', 'failed')),
  invoice_external_id TEXT,
  invoice_url TEXT,
  
  -- Estado de Pago (Abonos o Pago Completo)
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial_payment', 'paid_in_full')),
  
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  customer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. TABLA DETALLE DEL PEDIDO (order_items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. TABLA HISTORIAL DE ABONOS Y PAGOS (payments)
-- Permite manejar pagos totales o abonos parciales a los pedidos.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
  payment_method TEXT NOT NULL, -- e.g., 'transfer', 'cash', 'card', 'pse', 'wompi'
  payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO PARA CONSULTAS RÁPIDAS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- ----------------------------------------------------------------------------
-- DISPARADOR AUTOMÁTICO DE REGISTRO DE USUARIOS (auth.users -> profiles)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger tras registro en Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS: profiles
CREATE POLICY "Usuarios leen su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuarios actualizan su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- POLÍTICAS RLS: products
CREATE POLICY "Lectura pública de catálogo activo" ON public.products
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

CREATE POLICY "Escritura de productos solo por administradores" ON public.products
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

-- POLÍTICAS RLS: coupons
CREATE POLICY "Lectura pública de cupones activos" ON public.coupons
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Administrar cupones solo por admins" ON public.coupons
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- POLÍTICAS RLS: orders
CREATE POLICY "Usuarios leen sus propios pedidos" ON public.orders
  FOR SELECT USING (auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

CREATE POLICY "Actualizar estado de pedidos solo admins" ON public.orders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

-- POLÍTICAS RLS: order_items
CREATE POLICY "Usuarios leen detalle de sus pedidos" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
        AND (orders.profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')))
    )
  );

-- POLÍTICAS RLS: payments
CREATE POLICY "Usuarios ven pagos de sus pedidos" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
        AND (orders.profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')))
    )
  );

CREATE POLICY "Administrar pagos solo por admins" ON public.payments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'collaborator')));

-- ----------------------------------------------------------------------------
-- 7. FUNCIÓN RPC TRANSACCIONAL ATÓMICA: process_checkout
-- Previene que React u otro cliente resten inventario manualmente.
-- Ejecuta validación de stock, descuento atómico, creación de pedido e items en 1 sola transacción.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_checkout(
  p_profile_id UUID,
  p_items JSONB, -- Formato: [{"product_id": "uuid", "quantity": 2}]
  p_coupon_code TEXT DEFAULT NULL,
  p_shipping_address JSONB DEFAULT '{}'::jsonb,
  p_customer_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_product RECORD;
  v_subtotal NUMERIC(12, 2) := 0;
  v_discount NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2) := 0;
  v_coupon RECORD;
  v_order_id UUID;
  v_order_number TEXT;
  v_item_quantity INT;
  v_item_total NUMERIC(12, 2);
BEGIN
  -- 1. Validar que el arreglo de items no esté vacío
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El carrito de compras no contiene ningún producto.';
  END IF;

  -- 2. Iterar y BLOQUEAR filas de productos para validar stock atómicamente
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_quantity := (v_item->>'quantity')::INT;
    IF v_item_quantity <= 0 THEN
      RAISE EXCEPTION 'La cantidad del producto debe ser mayor a cero.';
    END IF;

    -- SELECT ... FOR UPDATE bloquea la fila del producto contra escrituras concurrentes
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El producto solicitado con ID % no está disponible o no existe.', (v_item->>'product_id');
    END IF;

    IF v_product.stock_qty < v_item_quantity THEN
      RAISE EXCEPTION 'Stock insuficiente para "%" (SKU: %). Disponible: %, Solicitado: %', 
        v_product.name, v_product.sku, v_product.stock_qty, v_item_quantity;
    END IF;

    -- Calcular precio usando descuento si aplica
    v_item_total := COALESCE(v_product.discount_price, v_product.price) * v_item_quantity;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- 3. Validar y aplicar cupón de descuento si se proporcionó
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = upper(trim(p_coupon_code))
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND current_uses < max_uses
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El cupón "%" no es válido, ha expirado o alcanzó su límite de usos.', p_coupon_code;
    END IF;

    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := (v_subtotal * v_coupon.discount_value / 100.0);
    ELSE
      v_discount := LEAST(v_subtotal, v_coupon.discount_value);
    END IF;

    -- Incrementar contador de uso del cupón
    UPDATE public.coupons
    SET current_uses = current_uses + 1
    WHERE id = v_coupon.id;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount);

  -- 4. Generar número de pedido único (Ejemplo: FERRE-20261001-XXXX)
  v_order_number := 'FERRE-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 5));

  -- 5. Insertar encabezado de Pedido (orders)
  INSERT INTO public.orders (
    order_number,
    profile_id,
    status,
    subtotal,
    discount_applied,
    total_amount,
    invoice_status,
    payment_status,
    shipping_address,
    customer_notes
  ) VALUES (
    v_order_number,
    p_profile_id,
    'pending',
    v_subtotal,
    v_discount,
    v_total,
    'pending',
    'pending',
    p_shipping_address,
    p_customer_notes
  )
  RETURNING id INTO v_order_id;

  -- 6. Insertar items del pedido y DESCONTAR INVENTARIO
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_quantity := (v_item->>'quantity')::INT;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID;

    v_item_total := COALESCE(v_product.discount_price, v_product.price) * v_item_quantity;

    -- Insertar linea en order_items
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_sku,
      product_name,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.sku,
      v_product.name,
      v_item_quantity,
      COALESCE(v_product.discount_price, v_product.price),
      v_item_total
    );

    -- Descontar inventario atómicamente
    UPDATE public.products
    SET stock_qty = stock_qty - v_item_quantity,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_product.id;
  END LOOP;

  -- 7. Retornar JSON con resultado exitoso
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total_amount', v_total
  );
END;
$$;

-- Permitir ejecución del RPC a usuarios autenticados y anónimos
GRANT EXECUTE ON FUNCTION public.process_checkout TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- DATOS INICIALES DE CUPONES DEMO
-- ----------------------------------------------------------------------------
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, is_active)
VALUES 
  ('FERRE20', 'percentage', 20, 500, true),
  ('DESCUENTO10k', 'fixed', 10000, 1000, true)
ON CONFLICT (code) DO NOTHING;
