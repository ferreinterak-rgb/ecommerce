import { Coupon } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_COUPONS_STORAGE_KEY = 'ferre_coupons_cache_v1';

const getStoredCoupons = (): Coupon[] => {
  try {
    const raw = localStorage.getItem(LOCAL_COUPONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const couponService = {
  async validateCoupon(code: string): Promise<Coupon | null> {
    const cleanCode = code.trim().toUpperCase();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .single();
        if (!error && data) return data as Coupon;
      } catch (e) {
        console.warn('Supabase coupon check failed, falling back to local list.', e);
      }
    }
    const localCoupons = getStoredCoupons();
    const found = localCoupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);
    return found || null;
  }
};
