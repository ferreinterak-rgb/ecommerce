import { ProductReview } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_REVIEWS_KEY = 'ferre_product_reviews_cache_v1';

const getInitialReviews = (): ProductReview[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_REVIEWS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
  }
  return [
    {
      id: 'rev-demo-1',
      product_id: 'default',
      user_name: 'Carlos Mendoza (Taller El Progreso)',
      rating: 5,
      title: 'Excelente calidad y despacho rápido',
      comment: 'Compramos al por mayor para nuestro taller. La calidad del material es impecable y la entrega en obra fue puntual.',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'rev-demo-2',
      product_id: 'default',
      user_name: 'Ferretería La Campana',
      rating: 5,
      title: 'Proveedor 100% recomendado',
      comment: 'Muy buenos precios mayoristas, nos atendieron directamente por WhatsApp para coordinar el flete.',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];
};

let localReviewsStore: ProductReview[] = getInitialReviews();

export const reviewService = {
  /**
   * Obtiene las reseñas aprobadas de un producto en específico
   */
  async getApprovedReviews(productId: string): Promise<ProductReview[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as ProductReview[];
        }
      } catch (e) {
        console.warn('Supabase fetch reviews failed, using local store:', e);
      }
    }

    // Retorna reseñas locales filtradas o reseñas demo si es un producto sin reseñas aún
    const matching = localReviewsStore.filter(r => r.product_id === productId && r.status === 'approved');
    if (matching.length > 0) return matching;

    // Si no hay específicas, devolver las demo generales para este producto
    return localReviewsStore.filter(r => r.product_id === 'default' && r.status === 'approved');
  },

  /**
   * Envía una nueva reseña para el producto
   */
  async submitReview(reviewData: {
    productId: string;
    userName: string;
    userEmail?: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<{ success: boolean; message: string; review?: ProductReview }> {
    const newReview: ProductReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: reviewData.productId,
      user_name: reviewData.userName.trim(),
      user_email: reviewData.userEmail?.trim(),
      rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
      title: reviewData.title?.trim(),
      comment: reviewData.comment.trim(),
      status: 'approved', // Aprobado automáticamente para feedback en tienda
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .insert({
            product_id: newReview.product_id,
            user_name: newReview.user_name,
            user_email: newReview.user_email,
            rating: newReview.rating,
            title: newReview.title,
            comment: newReview.comment,
            status: newReview.status
          })
          .select()
          .single();

        if (!error && data) {
          localReviewsStore.unshift(data as ProductReview);
          return { success: true, message: '¡Gracias por tu opinión! Tu reseña ha sido publicada.', review: data as ProductReview };
        }
      } catch (e) {
        console.warn('Supabase review insert fallback to local store:', e);
      }
    }

    localReviewsStore.unshift(newReview);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(localReviewsStore));
      } catch (_) {}
    }

    return { success: true, message: '¡Gracias por tu opinión! Tu reseña ha sido publicada.', review: newReview };
  }
};
