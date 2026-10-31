-- ==============================================================================
-- FERREINTER: SCRIPT COMPLEMENTARIO PARA SUPABASE
-- 1. Crear tabla de Reseñas de Clientes (product_reviews)
-- 2. Habilitar Storage Bucket público (product-images) para subida de fotos
-- ==============================================================================

-- 1. TABLA: product_reviews (Calificaciones y Reseñas de Productos)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.product_reviews(status);

-- Habilitar RLS en product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de Reseñas
DROP POLICY IF EXISTS "Permitir ver reseñas aprobadas" ON public.product_reviews;
CREATE POLICY "Permitir ver reseñas aprobadas"
    ON public.product_reviews FOR SELECT
    USING (status = 'approved');

DROP POLICY IF EXISTS "Permitir enviar nuevas reseñas publicas" ON public.product_reviews;
CREATE POLICY "Permitir enviar nuevas reseñas publicas"
    ON public.product_reviews FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir moderacion a administradores" ON public.product_reviews;
CREATE POLICY "Permitir moderacion a administradores"
    ON public.product_reviews FOR ALL
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 2. STORAGE BUCKET: product-images (Imágenes de Productos)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    TRUE,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif'];

-- Políticas de Storage para product-images
DROP POLICY IF EXISTS "Acceso publico lectura product-images" ON storage.objects;
CREATE POLICY "Acceso publico lectura product-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Subida permitida product-images" ON storage.objects;
CREATE POLICY "Subida permitida product-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Edicion y borrado product-images" ON storage.objects;
CREATE POLICY "Edicion y borrado product-images"
    ON storage.objects FOR ALL
    USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
