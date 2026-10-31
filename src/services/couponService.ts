import { Coupon } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_COUPONS_STORAGE_KEY = 'ferre_coupons_cache_v1';

const getStoredCoupons = (): Coupon[] => {
  try {
    const raw = localStorage.getItem(LOCAL_COUPONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'coup-ferre10',
        code: 'FERRE10',
        discount_type: 'percentage',
        discount_value: 10,
        discount_percentage: 10,
        min_purchase: 0,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'coup-ferre20',
        code: 'FERRE20',
        discount_type: 'percentage',
        discount_value: 20,
        discount_percentage: 20,
        min_purchase: 50000,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'coup-bienvenido',
        code: 'BIENVENIDO50',
        discount_type: 'fixed',
        discount_value: 50000,
        discount_percentage: 0,
        min_purchase: 200000,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  } catch (e) {
    return [];
  }
};

export const couponService = {
  async validateCoupon(code: string, currentSubtotal: number = 0): Promise<{ valid: boolean; coupon?: Coupon; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    let coupon: Coupon | null = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .single();
        if (!error && data) {
          coupon = {
            ...data,
            discount_type: data.discount_type || 'percentage',
            discount_value: Number(data.discount_value || data.discount_percentage || 0),
            discount_percentage: data.discount_type === 'percentage' ? Number(data.discount_value || data.discount_percentage) : 0,
            min_purchase: Number(data.min_purchase || 0)
          } as Coupon;
        }
      } catch (e) {
        console.warn('Supabase coupon check failed, falling back to local list.', e);
      }
    }

    if (!coupon) {
      const localCoupons = getStoredCoupons();
      coupon = localCoupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active) || null;
    }

    if (!coupon) {
      return { valid: false, message: 'Cupón no encontrado o inactivo. Prueba con FERRE10' };
    }

    // Validar fecha de expiración si existe
    const expiry = coupon.expiry_date || coupon.valid_until;
    if (expiry && new Date(expiry) < new Date()) {
      return { valid: false, message: 'Este cupón ya ha expirado.' };
    }

    // Validar monto mínimo de compra
    const minPurchase = coupon.min_purchase || 0;
    if (minPurchase > 0 && currentSubtotal < minPurchase) {
      return { 
        valid: false, 
        message: `Este cupón requiere una compra mínima de $${minPurchase.toLocaleString('es-CO')}.` 
      };
    }

    return { 
      valid: true, 
      coupon, 
      message: coupon.discount_type === 'fixed' 
        ? `¡Cupón ${coupon.code} aplicado! (-$${(coupon.discount_value || 0).toLocaleString('es-CO')} COP)`
        : `¡Cupón ${coupon.code} aplicado! (-${coupon.discount_value || coupon.discount_percentage}%)` 
    };
  }
};
