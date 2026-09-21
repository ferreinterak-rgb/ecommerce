import { Coupon } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'FERRE20',
    discount_percentage: 20,
    valid_until: '2028-12-31T23:59:59Z',
    max_uses: 500,
    used_count: 42,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c-2',
    code: 'PROFECTO15',
    discount_percentage: 15,
    valid_until: '2028-12-31T23:59:59Z',
    max_uses: 200,
    used_count: 18,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c-3',
    code: 'BIENVENIDO10',
    discount_percentage: 10,
    valid_until: '2028-12-31T23:59:59Z',
    max_uses: 1000,
    used_count: 120,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

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
    const found = MOCK_COUPONS.find(c => c.code.toUpperCase() === cleanCode && c.is_active);
    return found || null;
  }
};
