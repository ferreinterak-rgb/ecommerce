import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEWALT_CHOPSAW_IMAGE = '/dewalt-chopsaw.jpg';

export const INITIAL_PRODUCTS: Product[] = [
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

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (err) {
        console.warn('Falling back to initial products dataset:', err);
      }
    }
    return INITIAL_PRODUCTS;
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          return data as Product;
        }
      } catch (err) {
        console.warn('Error fetching product by slug from Supabase:', err);
      }
    }
    return INITIAL_PRODUCTS.find(p => p.slug === slug) || null;
  },

  saveProduct: async (productData: Partial<Product>): Promise<Product> => {
    if (isSupabaseConfigured()) {
      try {
        if (productData.id) {
          const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', productData.id)
            .select()
            .single();
          if (!error && data) return data as Product;
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();
          if (!error && data) return data as Product;
        }
      } catch (err) {
        console.warn('Error saving product in Supabase:', err);
      }
    }

    const id = productData.id || `p-${Date.now()}`;
    const fullProduct: Product = {
      id,
      name: productData.name || 'Nuevo Producto',
      slug: productData.slug || `producto-${Date.now()}`,
      brand: productData.brand || 'FERREINTER',
      sku: productData.sku || `SKU-${Date.now()}`,
      description: productData.description || '',
      price: productData.price || 0,
      category: productData.category || 'herramientas-electricas',
      stock: productData.stock || 10,
      images: productData.images && productData.images.length > 0 ? productData.images : [DEWALT_CHOPSAW_IMAGE],
      is_featured: productData.is_featured ?? false,
      is_active: productData.is_active ?? true,
      rating: productData.rating || 5,
      reviews_count: productData.reviews_count || 0,
      created_at: productData.created_at || new Date().toISOString()
    };

    const existingIdx = INITIAL_PRODUCTS.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      INITIAL_PRODUCTS[existingIdx] = fullProduct;
    } else {
      INITIAL_PRODUCTS.unshift(fullProduct);
    }
    return fullProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Error deleting product in Supabase:', err);
      }
    }
    const idx = INITIAL_PRODUCTS.findIndex(p => p.id === id);
    if (idx >= 0) {
      INITIAL_PRODUCTS.splice(idx, 1);
      return true;
    }
    return false;
  }
};
