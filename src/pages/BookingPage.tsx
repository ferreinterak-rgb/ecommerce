import React, { useState } from 'react';
import { ServiceType } from '../types';
import { appointmentService } from '../services/appointmentService';
import { activityLogService } from '../services/activityLogService';
import { CheckCircle2, ShieldCheck, User, Mail, Phone, ShoppingBag, FileText, Truck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingPage: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('cotizacion_volumen');
  const [preferredDate, setPreferredDate] = useState('2026-09-25');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [comments, setComments] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const app = await appointmentService.createAppointment({
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service_type: serviceType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        comments
      });

      await activityLogService.logAction(
        'Nueva Cotización E-Commerce',
        'Ventas Empresariales',
        app.id,
        `Cliente: ${clientName} - Tipo: ${serviceType} para fecha ${preferredDate}`,
        clientName
      );

      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando cotización', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-black text-slate-900">¡Solicitud de Cotización Recibida!</h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Un asesor comercial e-commerce de <strong>FERREINTER</strong> revisará tus requerimientos de compra y te enviará la oferta detallada a <strong>{clientEmail}</strong>.
        </p>

        <div className="p-6 rounded-2xl bg-[#111111] text-white max-w-md mx-auto space-y-2 border border-[#f48f25]/30">
          <h4 className="font-bold text-sm text-[#f48f25]">Resumen de Solicitud E-Commerce</h4>
          <p className="text-xs">Atención Programada: <strong>{preferredDate}</strong> ({preferredTime})</p>
          <p className="text-xs">Servicio: <strong>{serviceType.replace('_', ' ').toUpperCase()}</strong></p>
        </div>

        <div className="pt-4">
          <Link to="/catalog" className="px-7 py-3.5 rounded-full bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold text-xs uppercase tracking-wide">
            Explorar Tienda Online
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold text-[#f48f25] uppercase tracking-widest">
          VENTAS E-COMMERCE & ATENCIÓN EMPRESARIAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cotizaciones por Volumen & Ventas Corporativas
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Ofrecemos venta directa online con envíos nacionales. Solicita presupuestos corporativos y descuentos por volumen para constructoras e industrias.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Service Type Selection */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
              1. Selecciona el Tipo de Consulta Comercial *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'cotizacion_volumen', label: 'Cotización por Volumen', desc: 'Descuentos especiales por compras al por mayor' },
                { id: 'asesoria_comercial', label: 'Asesoría de Productos', desc: 'Selección de especificaciones y compatibilidad' },
                { id: 'ventas_corporativas', label: 'Ventas Empresariales', desc: 'Facturación electrónica y convenios corporativos' },
                { id: 'soporte_envios', label: 'Soporte de Pedidos & Envíos', desc: 'Seguimiento de despacho nacional' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setServiceType(s.id as ServiceType)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    serviceType === s.id
                      ? 'border-[#f48f25] bg-[#f5f5f7] ring-2 ring-[#f48f25]/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-xs">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
              2. Datos del Solicitante / Empresa *
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nombre Completo o Razón Social</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Constructora Bolívar S.A."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#f4f5f7] border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#f48f25]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Correo Electrónico Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@empresa.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-[#f4f5f7] border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#f48f25]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Teléfono o WhatsApp de Contacto</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="+57 300 123 4567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-[#f4f5f7] border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#f48f25]"
                />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
              3. Detalle de los Productos a Cotizar *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Escribe la lista de productos, referencias y cantidades requeridas..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-[#f4f5f7] border border-gray-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-[#f48f25]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold text-sm py-4 rounded-full shadow-lg transition-all transform active:scale-95 uppercase tracking-wide"
          >
            {submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Cotización ↗'}
          </button>

        </form>
      </div>

    </div>
  );
};
