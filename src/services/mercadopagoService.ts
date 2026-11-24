/**
 * Servicio de Integración para Mercado Pago Checkout Pro / API Oficial
 * FERRETERÍA FERREINTER
 */

import { supabase } from './supabaseClient';

const env = (import.meta as any).env || {};

const MP_PUBLIC_KEY =
  env.VITE_MERCADOPAGO_PUBLIC_KEY ||
  env.Ferreinter_public_key ||
  'APP_USR-04c3d90f-1266-4560-aaf4-6ed2ebd08c11';

const MP_ACCESS_TOKEN =
  env.VITE_MERCADOPAGO_ACCESS_TOKEN ||
  env.Ferreinter_access_token ||
  'APP_USR-2525830284617895-011619-d492725d33963d1bc8927a7e0cceebac-3139355697';

const MP_CLIENT_ID =
  env.VITE_MERCADOPAGO_CLIENT_ID ||
  env.Ferreinter_cliente_id ||
  '2525830284617895';

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
  identification?: {
    type: string;
    number: string;
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
   * Verifica si las credenciales oficiales de Mercado Pago están activas
   */
  isConfigured(): boolean {
    return Boolean(
      MP_PUBLIC_KEY &&
      MP_ACCESS_TOKEN &&
      !MP_PUBLIC_KEY.includes('placeholder')
    );
  },

  /**
   * Obtiene la Public Key oficial configurada
   */
  getPublicKey(): string {
    return MP_PUBLIC_KEY;
  },

  /**
   * Obtiene el Client ID configurado
   */
  getClientId(): string {
    return MP_CLIENT_ID;
  },

  /**
   * Crea la preferencia de pago real en la API oficial de Mercado Pago (Checkout Pro).
   */
  async createPaymentPreference(payload: CreatePreferencePayload): Promise<PreferenceResponse> {
    // 1. Normalizar items para Mercado Pago Colombia (COP requiere enteros positivos)
    const normalizedItems = payload.items
      .filter(item => Number(item.unit_price) > 0 && Number(item.quantity) > 0)
      .map(item => {
        let pictureUrl = item.picture_url;
        if (pictureUrl && pictureUrl.startsWith('/') && typeof window !== 'undefined') {
          if (window.location.origin.startsWith('https://')) {
            pictureUrl = `${window.location.origin}${pictureUrl}`;
          } else {
            pictureUrl = undefined;
          }
        }
        return {
          id: String(item.id),
          title: String(item.title).slice(0, 250),
          quantity: Math.max(1, Math.round(Number(item.quantity))),
          unit_price: Math.round(Number(item.unit_price)),
          currency_id: 'COP',
          ...(pictureUrl ? { picture_url: pictureUrl } : {}),
          ...(item.description ? { description: String(item.description).slice(0, 250) } : {})
        };
      });

    const isHttpsSuccessUrl = Boolean(
      payload.back_urls?.success && payload.back_urls.success.startsWith('https://')
    );

    const mpRequestBody: Record<string, any> = {
      external_reference: payload.order_number,
      statement_descriptor: 'FERREINTER',
      items: normalizedItems,
      payer: {
        name: payload.payer.name,
        email: payload.payer.email,
        ...(payload.payer.phone?.number
          ? { phone: { number: String(payload.payer.phone.number).replace(/\D/g, '') } }
          : {}),
        ...(payload.payer.identification?.number
          ? {
              identification: {
                type: payload.payer.identification.type || 'CC',
                number: String(payload.payer.identification.number).replace(/\D/g, '')
              }
            }
          : {}),
        ...(payload.payer.address?.street_name
          ? { address: { street_name: payload.payer.address.street_name } }
          : {})
      },
      ...(payload.back_urls ? { back_urls: payload.back_urls } : {}),
      ...(isHttpsSuccessUrl ? { auto_return: 'approved' } : {})
    };

    // 2. Llamar directamente a la API oficial de Mercado Pago con las credenciales de Ferreinter
    if (MP_ACCESS_TOKEN) {
      try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mpRequestBody)
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.init_point) {
            return {
              id: data.id,
              init_point: data.init_point,
              sandbox_init_point: data.sandbox_init_point
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error('Error devuelto por API Mercado Pago:', errData);
        }
      } catch (err) {
        console.warn('Error conectando con API directa de Mercado Pago, intentando Edge Function:', err);
      }
    }

    // 3. Fallback: Intentar Edge Function de Supabase si estuviera desplegada
    try {
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: mpRequestBody
      });

      if (!error && data?.init_point) {
        return {
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point
        };
      }
    } catch (err) {
      console.warn('Edge Function de Mercado Pago no disponible:', err);
    }

    throw new Error('No fue posible generar el link de pago con Mercado Pago. Por favor intenta nuevamente.');
  },

  /**
   * Consulta el estado real de un pago en Mercado Pago por payment_id
   */
  async getPaymentInfo(paymentId: string): Promise<{ status: string; external_reference?: string } | null> {
    if (!MP_ACCESS_TOKEN || !paymentId) return null;
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          status: data.status,
          external_reference: data.external_reference
        };
      }
    } catch (err) {
      console.warn('No se pudo verificar el estado del pago en Mercado Pago:', err);
    }
    return null;
  }
};
