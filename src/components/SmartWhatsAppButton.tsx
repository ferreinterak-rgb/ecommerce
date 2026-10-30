import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const WHATSAPP_PHONE_NUMBER = '573233712156'; // Número oficial: 3233712156

export const SmartWhatsAppButton: React.FC = () => {
  const location = useLocation();
  const { total, totalItemsCount } = useCart();
  const { formatPrice } = useCurrency();

  // Genera un mensaje inteligente de asistencia según la página actual o el carrito
  const getSmartMessage = (): string => {
    const path = location.pathname;

    // 1. Si el cliente tiene productos en el carrito
    if (totalItemsCount > 0) {
      return `Hola FERREINTER 👋 Tengo ${totalItemsCount} producto(s) en mi carrito por un valor de ${formatPrice(total)} y quisiera asistencia para confirmar existencias y coordinar mi compra.`;
    }

    // 2. Si está en la pantalla de checkout
    if (path === '/checkout') {
      return `Hola FERREINTER 👋 Estoy en el proceso de pago y requiero asistencia con los métodos de pago o el despacho de mi pedido.`;
    }

    // 3. Si está viendo el detalle de un producto
    if (path.startsWith('/product/')) {
      return `Hola FERREINTER 👋 Estoy viendo este producto en su catálogo (${window.location.href}) y quisiera consultar disponibilidad inmediata, especificaciones o precio por mayor.`;
    }

    // 4. Si está en el catálogo general
    if (path === '/catalog') {
      return `Hola FERREINTER 👋 Me encuentro explorando su catálogo y requiero asesoría técnica o cotización de herramientas y materiales.`;
    }

    // 5. Mensaje por defecto (Home o cualquier otra página)
    return `Hola FERREINTER 👋 Quisiera recibir asesoría comercial y cotización para mi compra.`;
  };

  const handleClick = () => {
    const message = getSmartMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
      {/* Botón flotante 3D de WhatsApp - Directo, limpio y sin recuadros */}
      <button
        onClick={handleClick}
        aria-label="Contactar por WhatsApp a FERREINTER (323 371 2156)"
        title="Chatear con un asesor de FERREINTER"
        className="relative group focus:outline-hidden transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Halo de luz / pulso verde sutil */}
        <span 
          className="absolute inset-0 rounded-full bg-emerald-500 opacity-25 group-hover:opacity-50 blur-lg animate-pulse"
          aria-hidden="true"
        ></span>

        {/* Ícono 3D circular transparente sin fondo blanco */}
        <div className="relative w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center filter drop-shadow-[0_8px_18px_rgba(22,163,74,0.45)]">
          <img
            src="/whatsapp-3d-icon.png"
            alt="WhatsApp Asesoría FERREINTER"
            className="w-full h-full object-contain pointer-events-none select-none"
            loading="eager"
          />

          {/* Indicador de asesor activo / notificación sutil */}
          <span className="absolute 0 top-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>

        {/* Tooltip sutil en hover exclusivo de escritorio (sin bloquear la vista) */}
        <div className="hidden sm:group-hover:flex items-center absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700/60 transition-all duration-200 pointer-events-none">
          <span>¿Necesitas ayuda? Chatea con nosotros</span>
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90"></div>
        </div>
      </button>
    </div>
  );
};
