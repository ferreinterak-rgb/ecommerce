import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_REAL_PRODUCTS } from './initialProducts';

const DEWALT_CHOPSAW_IMAGE = '/dewalt-chopsaw.jpg';

export const INITIAL_PRODUCTS: Product[] = INITIAL_REAL_PRODUCTS;

const LOCAL_STORAGE_KEY = 'ferre_products_cache_v3';

// Normaliza registros recibidos de Supabase hacia la interfaz Product
const normalizeProduct = (row: any): Product => {
  return {
    id: String(row.id || `p-${Date.now()}`),
    name: String(row.name || 'Herramienta sin nombre'),
    slug: String(row.slug || (row.name ? row.name.toLowerCase().replace(/\s+/g, '-') : `prod-${row.id}`)),
    brand: String(row.brand || 'FERREINTER'),
    sku: String(row.sku || `SKU-${row.id}`),
    description: String(row.description || ''),
    technical_specs: row.technical_specs || {},
    price: Number(row.price || 0),
    discount_price: row.discount_price !== null && row.discount_price !== undefined ? Number(row.discount_price) : undefined,
    wholesale_price: row.wholesale_price !== null && row.wholesale_price !== undefined ? Number(row.wholesale_price) : undefined,
    category: String(row.category || 'bisagras'),
    stock: Number(row.stock_qty !== undefined ? row.stock_qty : (row.stock !== undefined ? row.stock : 1000)),
    stock_warehouse: Number(row.stock_warehouse ?? 400),
    stock_store: Number(row.stock_store ?? 200),
    stock_online: Number(row.stock_online ?? 400),
    warranty: row.warranty || undefined,
    dimensions: row.dimensions || undefined,
    materials: row.materials || undefined,
    inventory_status: row.inventory_status || 'Disponible',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [DEWALT_CHOPSAW_IMAGE],
    is_featured: Boolean(row.is_featured ?? false),
    is_active: Boolean(row.is_active ?? true),
    rating: Number(row.rating || 5.0),
    reviews_count: Number(row.reviews_count || 0),
    created_at: String(row.created_at || new Date().toISOString())
  };
};

export const productService = {
  /**
   * 1. Lectura Ultra Rápida Client-First (<10ms)
   * Devuelve inmediatamente los datos locales y dispara la sincronización con Supabase en segundo plano.
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sincronización en segundo plano sin congelar la UI (Stale-While-Revalidate)
          productService.syncFromSupabase().catch(() => {});
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo cache local de productos:', e);
    }

    // Si no había caché, espera la sincronización directa
    return await productService.syncFromSupabase();
  },

  /**
   * 2. Sincronización en Segundo Plano con Supabase
   * Actualiza el caché local de forma silenciosa.
   */
  syncFromSupabase: async (): Promise<Product[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const normalized = data.map(normalizeProduct);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
            window.dispatchEvent(new CustomEvent('ferre_products_synced', { detail: normalized }));
          }
          return normalized;
        }
      } catch (err) {
        console.warn('Modo Offline: No se pudo contactar a Supabase, usando respaldo local:', err);
      }
    }

    // Respaldo de contingencia: si la base está vacía o no responde, usa INITIAL_PRODUCTS
    const fallback = INITIAL_PRODUCTS;
    if (typeof window !== 'undefined') {
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!existing) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
        }
      } catch (_) {}
    }
    return fallback;
  },

  /**
   * 3. Obtener Producto por Slug (Red en Tiempo Real + Cache de Respaldo)
   */
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    // 1. Siempre intentamos consultar directamente en Supabase para obtener las fotos y datos más recientes
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const norm = normalizeProduct(data);
          // Actualizar oportunamente el cache local con los datos frescos
          if (typeof window !== 'undefined') {
            try {
              const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
              const idx = current.findIndex((p: Product) => p.slug === slug || p.id === norm.id);
              if (idx >= 0) {
                current[idx] = norm;
              } else {
                current.unshift(norm);
              }
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
            } catch (_) {}
          }
          return norm;
        }
      } catch (err) {
        console.warn('Error obteniendo producto puntual en Supabase, consultando cache local:', err);
      }
    }

    // 2. Respaldo en cache local si estamos sin conexión o falla la red
    const products = await productService.getProducts();
    const found = products.find(p => p.slug === slug);
    return found || null;
  },

  /**
   * 4. Guardar / Actualizar Producto (Escritura Híbrida Optimista)
   * Actualiza inmediatamente el caché local y persiste en Supabase en background.
   */
  saveProduct: async (productData: Partial<Product>): Promise<Product> => {
    const id = productData.id || `p-${Date.now()}`;
    const fullProduct: Product = {
      id,
      name: productData.name || 'Nuevo Producto',
      slug: productData.slug || `producto-${Date.now()}`,
      brand: productData.brand || 'FERREINTER',
      sku: productData.sku || `SKU-${Date.now()}`,
      description: productData.description || '',
      price: productData.price || 0,
      discount_price: productData.discount_price,
      wholesale_price: productData.wholesale_price,
      category: productData.category || 'bisagras',
      stock: productData.stock !== undefined ? productData.stock : 1000,
      stock_warehouse: productData.stock_warehouse ?? 400,
      stock_store: productData.stock_store ?? 200,
      stock_online: productData.stock_online ?? 400,
      warranty: productData.warranty,
      dimensions: productData.dimensions,
      materials: productData.materials,
      inventory_status: productData.inventory_status || 'Disponible',
      images: productData.images && productData.images.length > 0 ? productData.images : [DEWALT_CHOPSAW_IMAGE],
      is_featured: productData.is_featured ?? false,
      is_active: productData.is_active ?? true,
      rating: productData.rating || 5,
      reviews_count: productData.reviews_count || 0,
      created_at: productData.created_at || new Date().toISOString()
    };

    // A) Actualización optimista inmediata en Cache Local
    try {
      const current = await productService.getProducts();
      const idx = current.findIndex(p => p.id === id || p.sku === fullProduct.sku);
      if (idx >= 0) {
        current[idx] = fullProduct;
      } else {
        current.unshift(fullProduct);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Error guardando en cache local:', e);
    }

    // B) Persistencia en Supabase
    if (isSupabaseConfigured()) {
      try {
        const dbPayload = {
          name: fullProduct.name,
          slug: fullProduct.slug,
          brand: fullProduct.brand,
          sku: fullProduct.sku,
          description: fullProduct.description,
          price: fullProduct.price,
          discount_price: fullProduct.discount_price,
          wholesale_price: fullProduct.wholesale_price,
          category: fullProduct.category,
          stock_qty: fullProduct.stock,
          stock_warehouse: fullProduct.stock_warehouse,
          stock_store: fullProduct.stock_store,
          stock_online: fullProduct.stock_online,
          warranty: fullProduct.warranty,
          dimensions: fullProduct.dimensions,
          materials: fullProduct.materials,
          inventory_status: fullProduct.inventory_status,
          images: fullProduct.images,
          is_featured: fullProduct.is_featured,
          is_active: fullProduct.is_active
        };

        if (productData.id && !productData.id.startsWith('p-')) {
          await supabase.from('products').update(dbPayload).eq('id', productData.id);
        } else {
          await supabase.from('products').upsert(dbPayload, { onConflict: 'sku' });
        }
      } catch (err) {
        console.warn('Error persistiendo en Supabase, conservado en local:', err);
      }
    }

    return fullProduct;
  },

  /**
   * 5. Eliminar Producto
   */
  deleteProduct: async (id: string): Promise<boolean> => {
    // Optimista local
    try {
      const current = await productService.getProducts();
      const filtered = current.filter(p => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (_) {}

    // Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
        return true;
      } catch (err) {
        console.warn('Error eliminando en Supabase:', err);
      }
    }
    return true;
  },

  /**
   * 6. Importación Masiva de Productos (Upsert Masivo)
   * Procesa listas de productos, actualiza el estado local e inserta/actualiza en Supabase
   */
  bulkUpsertProducts: async (
    items: Partial<Product>[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Cargar productos actuales para reconciliar
    const existing = await productService.getProducts();
    const updatedMap = new Map<string, Product>();
    existing.forEach(p => updatedMap.set(p.sku.toUpperCase(), p));

    const preparedProducts: Product[] = [];
    const dbPayloads: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const cleanSku = (item.sku || `SKU-${Date.now()}-${i}`).trim().toUpperCase();
        const existingProd = updatedMap.get(cleanSku);

        const cleanSlug = item.slug || (
          (item.name || 'producto')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + cleanSku.toLowerCase()
        );

        const fullProduct: Product = {
          id: existingProd?.id || `p-${Date.now()}-${i}`,
          sku: cleanSku,
          name: item.name || existingProd?.name || 'Producto Sin Nombre',
          slug: existingProd?.slug || cleanSlug,
          brand: item.brand || existingProd?.brand || 'FERREINTER',
          category: item.category || existingProd?.category || 'herrajes-carpinteria',
          price: Number(item.price) || existingProd?.price || 0,
          wholesale_price: item.wholesale_price !== undefined ? Number(item.wholesale_price) : existingProd?.wholesale_price,
          discount_price: item.discount_price !== undefined ? Number(item.discount_price) : existingProd?.discount_price,
          stock: item.stock !== undefined ? Number(item.stock) : (existingProd?.stock ?? 100),
          stock_warehouse: item.stock_warehouse !== undefined ? Number(item.stock_warehouse) : (existingProd?.stock_warehouse ?? 50),
          stock_store: item.stock_store !== undefined ? Number(item.stock_store) : (existingProd?.stock_store ?? 50),
          stock_online: item.stock_online !== undefined ? Number(item.stock_online) : (existingProd?.stock_online ?? 0),
          dimensions: item.dimensions || existingProd?.dimensions,
          materials: item.materials || existingProd?.materials,
          warranty: item.warranty || existingProd?.warranty || '1 año directo de fábrica',
          description: item.description || existingProd?.description || '',
          inventory_status: (item.stock ?? existingProd?.stock ?? 0) > 0 ? 'Disponible' : 'Agotado',
          images: (item.images && item.images.length > 0)
            ? item.images
            : (existingProd?.images && existingProd.images.length > 0 ? existingProd.images : [DEWALT_CHOPSAW_IMAGE]),
          is_featured: item.is_featured ?? existingProd?.is_featured ?? false,
          is_active: item.is_active ?? existingProd?.is_active ?? true,
          rating: existingProd?.rating || 5,
          reviews_count: existingProd?.reviews_count || 0,
          created_at: existingProd?.created_at || new Date().toISOString()
        };

        updatedMap.set(cleanSku, fullProduct);
        preparedProducts.push(fullProduct);

        dbPayloads.push({
          sku: fullProduct.sku,
          name: fullProduct.name,
          slug: fullProduct.slug,
          brand: fullProduct.brand,
          category: fullProduct.category,
          price: fullProduct.price,
          wholesale_price: fullProduct.wholesale_price,
          discount_price: fullProduct.discount_price,
          stock_qty: fullProduct.stock,
          stock_warehouse: fullProduct.stock_warehouse,
          stock_store: fullProduct.stock_store,
          stock_online: fullProduct.stock_online,
          dimensions: fullProduct.dimensions,
          materials: fullProduct.materials,
          warranty: fullProduct.warranty,
          description: fullProduct.description,
          inventory_status: fullProduct.inventory_status,
          images: fullProduct.images,
          is_featured: fullProduct.is_featured,
          is_active: fullProduct.is_active
        });

        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`Fila ${i + 1} (${items[i].sku || 'Sin SKU'}): ${err?.message || err}`);
      }

      if (onProgress && (i % 10 === 0 || i === items.length - 1)) {
        onProgress(i + 1, items.length);
      }
    }

    // Actualizar localmente
    const finalProductList = Array.from(updatedMap.values());
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalProductList));
      window.dispatchEvent(new CustomEvent('ferre_products_synced', { detail: finalProductList }));
    }

    // Persistir en Supabase en lotes de 50
    if (isSupabaseConfigured() && dbPayloads.length > 0) {
      const BATCH_SIZE = 50;
      for (let b = 0; b < dbPayloads.length; b += BATCH_SIZE) {
        const batch = dbPayloads.slice(b, b + BATCH_SIZE);
        try {
          const { error } = await supabase.from('products').upsert(batch, { onConflict: 'sku' });
          if (error) {
            console.warn(`Error en lote Supabase (${b} a ${b + batch.length}):`, error);
          }
        } catch (dbErr: any) {
          console.warn(`Excepción en lote Supabase:`, dbErr);
        }
      }
    }

    return { successCount, errorCount, errors };
  }
};
