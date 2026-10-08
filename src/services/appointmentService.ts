import { Appointment } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_APPOINTMENTS_KEY = 'ferre_local_appointments_v1';

const getInitialAppointments = (): Appointment[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
  }
  return [];
};

let localAppointments: Appointment[] = getInitialAppointments();

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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(localAppointments));
      } catch (_) {}
    }
    return newAppointment;
  }
};
