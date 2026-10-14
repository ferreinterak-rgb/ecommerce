/**
 * Servicio de Integración para Mercado Pago Checkout Pro / Webhook
 * FERRETERÍA FERREINTER
 */

import { supabase } from './supabaseClient';

export interface MercadoPagoPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  picture_url?: string;
  description?: string;
}

export interface MercadoPagoPayer {
  name: string;
  email: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
  address?: {
    street_name?: string;
    zip_code?: string;
  };
}

export interface CreatePreferencePayload {
  order_number: string;
  items: MercadoPagoPreferenceItem[];
  payer: MercadoPagoPayer;
  back_urls?: {
    success: string;
    pending: string;
    failure: string;
  };
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export const mercadopagoService = {
  /**
   * Verifica si las credenciales o endpoint de Mercado Pago están listos
   */
  isConfigured(): boolean {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    return Boolean(publicKey && !publicKey.includes('placeholder'));
  },

  /**
   * Obtiene la Public Key configurada (si existe)
   */
  getPublicKey(): string | null {
    return import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || null;
  },

  /**
   * Prepara y crea la preferencia de pago en Mercado Pago.
   * Si existe un backend o Edge Function de Supabase (`create-mercadopago-preference`),
   * delega la creación para no exponer el ACCESS_TOKEN secreto en el frontend.
   * De lo contrario, retorna un link simulado seguro para pruebas.
   */
  async createPaymentPreference(payload: CreatePreferencePayload): Promise<PreferenceResponse> {
    try {
      // 1. Intentar llamar a la función serverless de Supabase si está disponible
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: payload
      });

      if (!error && data?.init_point) {
        return {
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point
        };
      }
    } catch (err) {
      console.warn('Función de servidor Mercado Pago no detectada aún, usando fallback preparado.', err);
    }

    // 2. Fallback de preparación / sandbox listo para conectar cuando se ingrese el token
    return {
      id: `pref-mp-${payload.order_number}`,
      init_point: `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${payload.order_number}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=${payload.order_number}`
    };
  }
};
