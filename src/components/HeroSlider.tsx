import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, Zap, Shield, Battery, Wrench, Ruler, Award, CheckCircle2, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

interface SlideItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  productSlug: string;
  productImage: string;
  theme: {
    gradientClass: string; // Animated gradient keyframe background
    badgeBg: string;
    badgeText: string;
    textColor: string;
    accentColor: string;
    specsBg: string;
  };
  callouts: {
    label: string;
    value: string;
    icon: React.ElementType;
  }[];
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-toolbox',
    badge: 'TRUPER HEAVY-DUTY INDUSTRIAL',
    title: 'Caja de Herramientas Uso Rudo 20"',
    subtitle: 'Cierres de Acero Inoxidable & Polímero de Alto Impacto',
    description: 'Caja porta-herramientas reforzada con cierres broches metálicos anticorrosivos, bandeja organizadora extraíble y estructura indestructible.',
    price: 34.50, // Formatted via COP context ($ 136.275 COP)
    originalPrice: 42.00,
    productSlug: 'caja-de-herramientas-husky-20in',
    productImage: '/truper-toolbox.png',
    theme: {
      gradientClass: 'bg-gradient-to-r from-slate-950 via-[#1c1917] via-[#ea580c]/30 to-zinc-950 text-white animate-gradient-shift',
      badgeBg: 'bg-[#ea580c]',
      badgeText: 'text-white',
      textColor: 'text-white',
      accentColor: 'text-[#ea580c]',
      specsBg: 'bg-white/10 backdrop-blur-md border border-white/15',
    },
    callouts: [
      { label: 'CIERRES', value: 'Broches Metálicos Inoxidables', icon: Shield },
      { label: 'ESTRUCTURA', value: 'Polímero de Alto Impacto 20"', icon: Package },
      { label: 'ORGANIZACIÓN', value: 'Bandeja Extraíble de 2 Niveles', icon: Award },
    ]
  },
  {
    id: 'slide-flexometro',
    badge: 'TRUPER GRIPPER CINTA ANCHA 10M / 33FT',
    title: 'Flexómetro PowerLock 25ft / 7.5m',
    subtitle: 'Cinta Ancha de Alta Visibilidad & Carcasa Antiderrapante',
    description: 'Flexómetro profesional Gripper de 10m/33ft con cinta ancha de 32mm recubierta en polímero resistente a la abrasión y freno de impacto.',
    price: 21.99,
    originalPrice: 26.00,
    productSlug: 'cinta-metrica-stanley-powerlock-25ft',
    productImage: '/truper-flexometro.png',
    theme: {
      gradientClass: 'bg-gradient-to-r from-[#c2410c] via-[#ea580c] via-[#09090b] to-zinc-950 text-white animate-gradient-shift',
      badgeBg: 'bg-white',
      badgeText: 'text-black',
      textColor: 'text-white',
      accentColor: 'text-amber-300',
      specsBg: 'bg-black/40 backdrop-blur-md border border-white/20',
    },
    callouts: [
      { label: 'ALCANCE', value: '10 Metros / 33 Pies Cinta Ancha', icon: Ruler },
      { label: 'RECUBRIMIENTO', value: 'Polímero Gripper Antiderrapante', icon: Shield },
      { label: 'GANCHO', value: 'Doble Cero Absoluto Magnético', icon: CheckCircle2 },
    ]
  },
  {
    id: 'slide-drill-kit',
    badge: 'DEWALT 20V MAX BRUSHLESS + KIT 100 ACCESORIOS',
    title: 'Taladro Percutor 20V Sin Carbones',
    subtitle: 'Combo Completo con Maletín & Juego de 100 Brocas',
    description: 'Taladro percutor inalámbrico Brushless sin carbones con 2 baterías de litio, cargador rápido y maletín rígido con 100 accesorios profesionales.',
    price: 199.00,
    originalPrice: 239.00,
    productSlug: 'taladro-percutor-dewalt-20v-max',
    productImage: '/dewalt-drill-kit.jpg',
    theme: {
      gradientClass: 'bg-gradient-to-r from-slate-950 via-[#18181b] via-[#f48f25]/20 to-zinc-950 text-white animate-gradient-shift',
      badgeBg: 'bg-[#f48f25]',
      badgeText: 'text-black',
      textColor: 'text-white',
      accentColor: 'text-[#f48f25]',
      specsBg: 'bg-white/10 backdrop-blur-md border border-white/15',
    },
    callouts: [
      { label: 'MOTOR BRUSHLESS', value: 'Sin Carbones de Alta Eficiencia', icon: Zap },
      { label: 'ACCESORIOS', value: 'Kit de 100 Brocas & Puntas', icon: Wrench },
      { label: 'BATERÍAS', value: '2x Litio-Ion 20V Max de Repuesto', icon: Battery },
    ]
  },
  {
    id: 'slide-chopsaw',
    badge: 'DEWALT SERIE INDUSTRIAL 2200W',
    title: 'Tronzadora Profesional de Metales 14"',
    subtitle: 'Corte de Alta Precisión en Aceros Pesados',
    description: 'Tronzadora de disco de 14 pulgadas con motor de alto rendimiento de 2200W, prensa de ajuste rápido y deflector de chispas ajustable.',
    price: 189.99,
    originalPrice: 219.00,
    productSlug: 'tronzadora-de-metales-dewalt-14-2200w',
    productImage: '/dewalt-chopsaw.jpg',
    theme: {
      gradientClass: 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] via-[#f48f25]/20 to-slate-950 text-white animate-gradient-shift',
      badgeBg: 'bg-[#f48f25]',
      badgeText: 'text-black',
      textColor: 'text-white',
      accentColor: 'text-[#f48f25]',
      specsBg: 'bg-white/10 backdrop-blur-md border border-white/15',
    },
    callouts: [
      { label: 'POTENCIA', value: 'Motor 2200W / 3,800 RPM', icon: Zap },
      { label: 'DISCO', value: '14" (355mm) Abrasivo de Alta Resistencia', icon: Shield },
      { label: 'SEGURIDAD', value: 'Deflector de Chispas & Guarda Protectora', icon: CheckCircle2 },
    ]
  }
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  // Autoplay timer (5 seconds per slide)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      className={`relative overflow-hidden transition-all duration-1000 font-sans border-b border-gray-200/60 min-h-[580px] lg:min-h-[620px] flex items-center ${currentSlide.theme.gradientClass}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Dynamic Keyframe Ambient Light Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f48f25]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 right-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Text & Infographic Callouts */}
          <div className="lg:col-span-6 space-y-6 animate-fadeIn">
            
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase font-mono tracking-widest shadow-md ${currentSlide.theme.badgeBg} ${currentSlide.theme.badgeText}`}>
                {currentSlide.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {currentSlide.title}
              </h1>
              <p className={`text-sm sm:text-base font-bold ${currentSlide.theme.accentColor}`}>
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm opacity-90 max-w-xl leading-relaxed font-medium">
              {currentSlide.description}
            </p>

            {/* Technical Specs Callout Box matching Infographic style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {currentSlide.callouts.map((call, idx) => {
                const IconComp = call.icon;
                return (
                  <div key={idx} className={`p-3.5 rounded-2xl ${currentSlide.theme.specsBg} space-y-1 transition-all hover:scale-105 shadow-sm`}>
                    <div className="flex items-center gap-1.5">
                      <IconComp className={`w-4 h-4 ${currentSlide.theme.accentColor}`} />
                      <span className="text-[10px] font-black font-mono uppercase tracking-wider opacity-85">{call.label}</span>
                    </div>
                    <p className="text-xs font-bold truncate">{call.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Pricing & CTA Pill Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              
              {/* Colombian Price Display */}
              <div className="flex flex-col pr-4 border-r border-white/20">
                <span className="text-xs uppercase font-mono tracking-wider opacity-75">PRECIO ESPECIAL</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                    {formatPrice(currentSlide.price)}
                  </span>
                  {currentSlide.originalPrice && (
                    <span className="text-xs opacity-60 line-through font-mono">
                      {formatPrice(currentSlide.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <Link
                to={`/product/${currentSlide.productSlug}`}
                className="bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 uppercase tracking-wide"
              >
                <span>Comprar Ahora</span>
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to={`/product/${currentSlide.productSlug}`}
                className="text-xs sm:text-sm font-bold opacity-90 hover:opacity-100 underline hover:text-[#f48f25] transition-colors px-2 py-2"
              >
                Ver Ficha Técnica
              </Link>

            </div>

          </div>

          {/* Right Column: Isolated Floating Product WITHOUT background card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            
            {/* Pure Floating Isolated Product Image with Keyframe Float Animation & Heavy Studio Drop Shadow */}
            <div className="relative w-full max-w-md lg:max-w-xl aspect-square flex items-center justify-center p-4">
              
              <img
                src={currentSlide.productImage}
                alt={currentSlide.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)] animate-float-product transition-all duration-700 hover:scale-105"
              />

              {/* Floating Tech Pill Badge */}
              <div className="absolute top-6 left-2 sm:left-6 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono font-bold shadow-xl border border-white/20 flex items-center gap-2 animate-bounce">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f48f25]" />
                <span>FERREINTER ESTUDIO 100% ISOLADO</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Navigation Arrow Buttons Left / Right */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 border border-gray-200 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 z-20"
        aria-label="Diapositiva Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 border border-gray-200 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 z-20"
        aria-label="Siguiente Diapositiva"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Pagination Indicators at the Bottom Center */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-8 bg-[#f48f25]'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Ir a diapositiva ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
};
