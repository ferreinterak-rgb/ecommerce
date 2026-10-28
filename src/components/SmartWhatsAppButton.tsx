import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { FerreInterLogo } from './FerreInterLogo';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCheck, 
  PhoneCall, 
  ShoppingBag, 
  Package, 
  Truck, 
  Wrench, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';

const WHATSAPP_PHONE_NUMBER = '573233712156'; // Redirige al 3233712156

export const SmartWhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  const location = useLocation();
  const { cart, total, totalItemsCount } = useCart();
  const { formatPrice } = useCurrency();
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generar timestamp realista estilo WhatsApp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mostrar teaser inteligente después de 3.5 segundos en la primera visita
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPrompted) {
        setShowTeaser(true);
        setHasPrompted(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [hasPrompted]);

  // Cerrar al presionar Escape o clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowTeaser(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Redirección directa y segura a WhatsApp
  const launchWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text.trim());
    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Manejo de envío de texto personalizado
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;
    launchWhatsApp(customMessage);
    setCustomMessage('');
  };

  // Determinar mensaje inteligente según el contexto del usuario (Ruta y Carrito)
  const isProductPage = location.pathname.startsWith('/product/');
  const isCheckoutPage = location.pathname === '/checkout';
  const isCatalogPage = location.pathname === '/catalog';
  const hasCartItems = totalItemsCount > 0;

  // Texto del asistente inteligente
  const getContextualGreeting = () => {
    if (isCheckoutPage) {
      return {
        tag: 'Asistencia en Checkout',
        message: '👋 ¡Hola! ¿Necesitas ayuda para concretar tu pago, coordinar transferencia directa o validar el flete de tu pedido?'
      };
    }

    if (isProductPage) {
      return {
        tag: 'Asesoría de Producto',
        message: '👋 ¡Hola! Veo que estás consultando este producto en nuestro catálogo. ¿Deseas verificar existencias inmediatas, ficha técnica o solicitar precio especial por volumen?'
      };
    }

    if (hasCartItems) {
      return {
        tag: 'Tu Pedido en Marcha',
        message: `👋 ¡Hola! Tienes ${totalItemsCount} producto(s) en tu carrito por un valor de ${formatPrice(total)}. ¿Podemos ayudarte a cotizar flete prioritario o gestionar compra al por mayor?`
      };
    }

    if (isCatalogPage) {
      return {
        tag: 'Búsqueda en Catálogo',
        message: '👋 ¡Hola! ¿Buscas alguna marca, referencia o herramienta específica? Escríbenos y un asesor técnico te orienta al instante.'
      };
    }

    return {
      tag: 'Atención FERREINTER',
      message: '👋 ¡Hola! Bienvenido a **FERREINTER**. Somos tu proveedor directo en ferretería, herramientas y acabados. ¿En qué podemos apoyarte hoy?'
    };
  };

  const contextInfo = getContextualGreeting();

  // Opciones inteligentes predeterminadas
  const smartOptions = [
    ...(hasCartItems ? [{
      id: 'cart-checkout',
      icon: <ShoppingBag className="w-4 h-4 text-[#ff5500]" />,
      label: `Comprar mi carrito (${totalItemsCount} prod.)`,
      text: `Hola FERREINTER 👋 Tengo ${totalItemsCount} producto(s) en mi carrito por un valor de ${formatPrice(total)} y quisiera concretar mi compra y coordinar despacho prioritario.`
    }] : []),
    {
      id: 'wholesale',
      icon: <Package className="w-4 h-4 text-emerald-600" />,
      label: 'Cotización al por mayor (Ferreterías)',
      text: 'Hola FERREINTER 👋 Requiero una cotización al por mayor para abastecer mi ferretería / taller. ¿Me podrían brindar asesoría y precios mayoristas?'
    },
    {
      id: 'technical',
      icon: <Wrench className="w-4 h-4 text-amber-600" />,
      label: isProductPage ? 'Duda técnica sobre este producto' : 'Asesoría técnica para mi compra',
      text: isProductPage 
        ? `Hola FERREINTER 👋 Estoy viendo este producto (${window.location.href}) y quisiera confirmar disponibilidad, especificaciones y tiempo de entrega.`
        : 'Hola FERREINTER 👋 Necesito asesoría técnica para elegir las herramientas o materiales indicados para mi obra o proyecto.'
    },
    {
      id: 'shipping',
      icon: <Truck className="w-4 h-4 text-blue-600" />,
      label: 'Consultar cobertura de envíos y flete',
      text: 'Hola FERREINTER 👋 Quisiera consultar cobertura de envío, transportadora y costo hacia mi ciudad.'
    },
    {
      id: 'advisor',
      icon: <PhoneCall className="w-4 h-4 text-emerald-700" />,
      label: 'Hablar con un asesor comercial',
      text: 'Hola FERREINTER 👋 Me gustaría comunicarme directamente con un asesor de ventas para realizar un pedido.'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none pointer-events-none">
      
      {/* 1. TEASER FLOTANTE INTELIGENTE (Aparece suavemente si el chat está cerrado) */}
      {!isOpen && showTeaser && (
        <div 
          className="pointer-events-auto mb-3 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md text-slate-800 p-3.5 rounded-2xl shadow-2xl border border-slate-200/80 animate-fade-in transition-all duration-300 flex items-start gap-3 relative group"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
            aria-label="Cerrar sugerencia"
            className="absolute -top-2 -left-2 bg-slate-900 text-white rounded-full p-1 shadow-md hover:bg-[#ff5500] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>

          <div 
            onClick={() => {
              setIsOpen(true);
              setShowTeaser(false);
            }}
            className="flex items-start gap-3 cursor-pointer"
          >
            <div className="relative shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center p-1.5 border border-slate-700 shadow-inner">
                <FerreInterLogo size="sm" variant="light" className="scale-75 origin-center" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400 animate-pulse"></span>
            </div>

            <div className="text-left text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-slate-900 text-[11px] tracking-tight">FERREINTER Asistencia</span>
                <span className="inline-block bg-[#ff5500]/10 text-[#ff5500] font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase">
                  En línea
                </span>
              </div>
              <p className="text-slate-600 line-clamp-2">
                {hasCartItems 
                  ? `Tienes ${totalItemsCount} producto(s) en carrito. ¿Deseas coordinar entrega prioritaria por WhatsApp?`
                  : '¿Necesitas ayuda con tu compra o cotización por mayor? Chatea con nosotros.'
                }
              </p>
              <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600 hover:text-emerald-700">
                <span>Abrir chat de WhatsApp</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VENTANA DE CHAT ASISTENTE (ESTILO WHATSAPP + BRANDING FERREINTER) */}
      {isOpen && (
        <div
          ref={popupRef}
          className="pointer-events-auto mb-4 w-[calc(100vw-2rem)] sm:w-[390px] max-h-[85vh] sm:max-h-[640px] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5500]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 shadow-md">
                  <FerreInterLogo size="sm" variant="light" className="scale-90" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 ring-2 ring-emerald-500/40 animate-pulse"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">FERREINTER</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Asesoría en compras y pedidos
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors relative z-10"
              aria-label="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-barra de estatus y horario */}
          <div className="bg-emerald-700/10 border-b border-emerald-600/20 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Respuesta habitual: <strong>en menos de 5 min</strong>
            </span>
            <span className="font-mono text-emerald-700 text-[10px]">323 371 2156</span>
          </div>

          {/* Contenedor de Mensajes estilo WhatsApp */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#eae6df] bg-opacity-70"
            style={{
              backgroundImage: 'radial-gradient(#0000000d 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          >
            {/* Divisor de Fecha */}
            <div className="flex justify-center">
              <span className="bg-white/80 backdrop-blur-sm text-slate-500 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-xs border border-slate-200/60">
                Hoy • {currentTime}
              </span>
            </div>

            {/* Burbuja de Saludo Inteligente del Asesor */}
            <div className="flex flex-col items-start max-w-[90%]">
              <div className="bg-white text-slate-800 p-3.5 rounded-2xl rounded-tl-xs shadow-sm border border-slate-200/80 text-xs leading-relaxed relative">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-[#ff5500] text-[10px] uppercase tracking-wider">
                    {contextInfo.tag}
                  </span>
                  <span className="text-[10px] text-slate-400">{currentTime}</span>
                </div>
                <p className="whitespace-pre-line text-slate-700">
                  {contextInfo.message}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Asesor FERREINTER</span>
                  <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                  </span>
                </div>
              </div>
            </div>

            {/* Opciones rápidas e inteligentes */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                ¿Qué deseas consultar?
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {smartOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => launchWhatsApp(opt.text)}
                    className="w-full text-left bg-white/95 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/80 p-2.5 rounded-xl transition-all shadow-2xs hover:shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        {opt.icon}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800 truncate">
                        {opt.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formulario / Input para escribir mensaje directo */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!customMessage.trim()}
              aria-label="Enviar por WhatsApp"
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer aclaratorio */}
          <div className="bg-slate-50 px-3 py-1.5 text-center border-t border-slate-100 text-[10px] text-slate-400">
            Al enviar serás redirigido al WhatsApp oficial de FERREINTER.
          </div>
        </div>
      )}

      {/* 3. BOTÓN FLOTANTE 3D DE WHATSAPP (ESTILO FOTORREALISTA / GLOSSY) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTeaser(false);
        }}
        aria-label="Abrir asistente de compra de WhatsApp"
        className="pointer-events-auto relative group focus:outline-hidden transition-transform duration-300 active:scale-90 hover:scale-105"
      >
        {/* Anillo de pulso sutil */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 blur-md animate-ping duration-1000"></span>

        {/* Contenedor del Icono 3D Oficial */}
        <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full drop-shadow-[0_12px_24px_rgba(37,211,102,0.45)] transition-all">
          <img 
            src="/whatsapp-3d-icon.png" 
            alt="WhatsApp Asesoría FERREINTER" 
            className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
            onError={(e) => {
              // Fallback si por alguna razón falla el asset local
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.className = 'w-14 h-14 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center text-white shadow-xl';
              }
            }}
          />

          {/* Badge inteligente: Indicador de asesor disponible */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ff5500] text-white text-[9px] font-black items-center justify-center shadow-sm">
              1
            </span>
          </span>
        </div>
      </button>

    </div>
  );
};
