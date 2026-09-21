import { Appointment } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-101',
    client_name: 'Constructora Bolívar S.A.',
    client_email: 'ingenieria@constructorabolivar.com',
    client_phone: '+57 311 888 9900',
    service_type: 'cotizacion_volumen',
    preferred_date: '2026-09-25',
    preferred_time: '10:00 AM',
    status: 'pending',
    comments: 'Requerimos cotización e-commerce por volumen para 150 kits de herramientas eléctricas para nueva obra.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'app-102',
    client_name: 'Distribuidora Industrial El Piñón',
    client_email: 'contacto@distribuidoraelpinon.co',
    client_phone: '+57 301 777 4433',
    service_type: 'ventas_corporativas',
    preferred_date: '2026-09-22',
    preferred_time: '02:30 PM',
    status: 'confirmed',
    assigned_to: 'Asesor Comercial Andrés Restrepo',
    comments: 'Solicitud de catálogo mayorista e-commerce y facturación corporativa.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

let localAppointments: Appointment[] = [...MOCK_APPOINTMENTS];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Appointment[];
      } catch (e) {
        console.warn('Supabase get appointments error', e);
      }
    }
    return localAppointments;
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: `app-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('appointments').insert(newAppointment).select().single();
        if (!error && data) return data as Appointment;
      } catch (e) {
        console.warn('Supabase create appointment error', e);
      }
    }

    localAppointments.unshift(newAppointment);
    return newAppointment;
  }
};
