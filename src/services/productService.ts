import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_REAL_PRODUCTS } from './initialProducts';

const DEWALT_CHOPSAW_IMAGE = '/dewalt-chopsaw.jpg';

export const INITIAL_PRODUCTS: Product[] = INITIAL_REAL_PRODUCTS;

const LEGACY_MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Tronzadora de Metales DeWalt 14" 2200W (Chop Saw)',
    slug: 'tronzadora-de-metales-dewalt-14-2200w',
    brand: 'DeWalt',
    sku: 'D28730-14IN',
    description: 'Tronzadora de disco de 14 pulgadas con motor de alto rendimiento de 2200W, prensa de ajuste rápido y deflector de chispas ajustable.',
    technical_specs: {
      'Potencia': '2200 W',
      'Diámetro de disco': '14" (355mm)',
      'Velocidad': '3,800 RPM',
      'Peso': '15.5 kg',
      'Garantía': '3 años oficial'
    },
    price: 199.00,
    discount_price: 179.99,
    category: 'herramientas-electricas',
    stock: 18,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 54,
    created_at: new Date().toISOString()
  },
  {
    id: 'p-2',
    name: 'Taladro Percutor Inalámbrico DeWalt 20V Max XR Brushless',
    slug: 'taladro-percutor-dewalt-20v-max',
    brand: 'DeWalt',
    sku: 'DCD996B-20V',
    description: 'Taladro percutor de alta velocidad con motor sin carbones (Brushless), 3 velocidades y mandril metálico de nitrocarburado de 1/2 pulgada.',
    technical_specs: {
      'Voltaje': '20V Max',
      'Mandril': '1/2" (13mm) Metálico',
      'Velocidad': '0-450 / 0-1300 / 0-2000 RPM',
      'Impactos por minuto': '0-38,250 BPM',
      'Garantía': '3 años'
    },
    price: 180.00,
    discount_price: 159.99,
    category: 'herramientas-electricas',
    stock: 24,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 42,
    created_at: new Date().toISOString()
  },
  {
    id: 'p-3',
    name: 'Cinta Métrica Stanley PowerLock 25ft con Traba Automática',
    slug: 'cinta-metrica-stanley-powerlock-25ft',
    brand: 'Stanley',
    sku: 'ST-33-425',
    description: 'Cinta métrica profesional de 25 pies (7.5 metros) con recubrimiento de Mylar para máxima durabilidad y estuche cromado de alta resistencia.',
    technical_specs: {
      'Longitud': '25 pies / 7.5m',
      'Ancho de cinta': '1 pulgada',
      'Recubrimiento': 'Mylar®',
      'Gancho': 'Cero absoluto anticorrosivo'
    },
    price: 25.00,
    discount_price: 21.99,
    category: 'herramientas-manuales',
    stock: 120,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 4.8,
    reviews_count: 128,
    created_at: new Date().toISOString()
  },
  {
    id: 'p-4',
    name: 'Caja de Herramientas Uso Rudo Husky 20 in. Cierres de Acero',
    slug: 'caja-de-herramientas-husky-20in',
    brand: 'Husky',
    sku: 'HSK-20-TB',
    description: 'Caja porta-herramientas de poliéster reforzado y polímero de alto impacto. Incluye bandeja extraíble y cierres de acero inoxidable.',
    technical_specs: {
      'Dimensiones': '50.8 cm x 25.4 cm x 24.1 cm',
      'Capacidad de carga': '25 kg',
      'Material': 'Polipropileno / Acero',
      'Resistencia al agua': 'IP54'
    },
    price: 34.50,
    category: 'herramientas-manuales',
    stock: 45,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 65,
    created_at: new Date().toISOString()
  },
  {
    id: 'p-5',
    name: 'Juego de Llaves Mixtas Craftsman 20 Piezas Métrico y SAE',
    slug: 'juego-de-llaves-craftsman-20-piezas',
    brand: 'Craftsman',
    sku: 'CMMT12034',
    description: 'Juego completo de llaves combinadas de acero cromo vanadio forjado a presión con acabado de níquel cromo anticorrosión.',
    technical_specs: {
      'Piezas': '20 llaves',
      'Medidas': 'Métricas (8-19mm) y SAE (1/4" - 3/4")',
      'Material': 'Acero Cromo Vanadio'
    },
    price: 80.00,
    discount_price: 69.99,
    category: 'herramientas-manuales',
    stock: 30,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 88,
    created_at: new Date().toISOString()
  },
  {
    id: 'p-6',
    name: 'Escalera de Tijera de Aluminio Werner 6 ft. 150kg Carga',
    slug: 'escalera-aluminio-werner-6ft',
    brand: 'Werner',
    sku: 'W-6FT-AL',
    description: 'Escalera de tijera ligera de aluminio de 6 pies con bandeja de herramientas integrada y tacones antideslizantes de alta seguridad.',
    technical_specs: {
      'Altura': '6 pies (1.8m)',
      'Capacidad de carga': '150 kg',
      'Material': 'Aluminio de aviación',
      'Norma': 'ANSI A14.2'
    },
    price: 129.00,
    category: 'seguridad-herrajes',
    stock: 12,
    images: [DEWALT_CHOPSAW_IMAGE],
    is_featured: true,
    is_active: true,
    rating: 4.7,
    reviews_count: 34,
    created_at: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'ferre_products_cache_v2';

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
    category: String(row.category || 'herramientas-electricas'),
    // Compatibilidad tanto con stock_qty (esquema DDL) como stock
    stock: Number(row.stock_qty !== undefined ? row.stock_qty : (row.stock !== undefined ? row.stock : 10)),
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
   * 3. Obtener Producto por Slug (Cache + Red)
   */
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    const products = await productService.getProducts();
    const found = products.find(p => p.slug === slug);
    if (found) return found;

    // Si no está en el listado inicial, intenta consulta puntual en Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const norm = normalizeProduct(data);
          return norm;
        }
      } catch (err) {
        console.warn('Error obteniendo producto puntual en Supabase:', err);
      }
    }
    return null;
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
      category: productData.category || 'herramientas-electricas',
      stock: productData.stock !== undefined ? productData.stock : 10,
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
          category: fullProduct.category,
          stock_qty: fullProduct.stock,
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
  }
};
