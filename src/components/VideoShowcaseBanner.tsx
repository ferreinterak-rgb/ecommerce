import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface ShowcaseSlide {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  slogan: string;
  price: number;
  badge?: string;
  refLabel: string;
  usageLabel: string;
  link: string;
  image: string;
  accentColor: string;
  gradient: string;
  ambientLight: string;
  highlightSpecs: string[];
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'chapa-lp007',
    sku: 'LP007',
    slogan: 'EL CAMBIO ESTÁ EN LOS DETALLES.',
    title: 'Chapa de manija cuadrada negra',
    subtitle: 'Acabado Mate Industrial de Alta Resistencia',
    price: 55000,
    badge: 'MÁS VENDIDO',
    refLabel: 'REF. LP007',
    usageLabel: 'Para alcoba y baño • Fácil instalación',
    link: '/product/chapa-manija-cuadrada-cromada-alcoba-lp007',
    image: '/banner-chapa-lp007.jpg',
    accentColor: '#f48f25',
    gradient: 'from-[#0b0c10] via-[#12141a] to-[#1a120b]',
    ambientLight: 'rgba(244, 143, 37, 0.25)',
    highlightSpecs: ['Mecanismo Reforzado', '3 Llaves de Seguridad', 'Garantía 1 Año']
  },
  {
    id: 'disco-709-37',
    sku: '709-37',
    slogan: 'PRECISIÓN QUIRÚRGICA EN CADA CORTE.',
    title: 'Disco Corte Aluminio & Madera 10"',
    subtitle: '100 Dientes de Carburo de Tungsteno',
    price: 155000,
    badge: 'CALIDAD INDUSTRIAL',
    refLabel: 'REF. 709-37',
    usageLabel: 'Ideal para ingleteadoras y sierras de banco',
    link: '/product/disco-corte-aluminio-madera-10-pulgadas-x-100-dientes-709-37',
    image: 'https://clufybkujyzhzffpymti.supabase.co/storage/v1/object/public/products/catalog/1791900567674_DISCO_CORTE_100_DIEN.jfif',
    accentColor: '#ff6b35',
    gradient: 'from-[#0a0f18] via-[#0f172a] to-[#1c130d]',
    ambientLight: 'rgba(255, 107, 53, 0.22)',
    highlightSpecs: ['100 Dientes TCG', 'Cortes Limpios sin Rebaba', 'Cuerpo de Acero Templado']
  },
  {
    id: 'chapa-lp006',
    sku: 'LP006',
    slogan: 'ELEGANCIA Y SEGURIDAD PARA TU HOGAR.',
    title: 'Chapa Cilíndrica Negra Mate',
    subtitle: 'Línea Premium para Baño y Privacidad',
    price: 27000,
    badge: 'PRECIO ESPECIAL',
    refLabel: 'REF. LP006',
    usageLabel: 'Diseño ergonómico • Acabado electrostático',
    link: '/product/chapa-manija-cilindrica-negra-bao-lp006',
    image: 'https://clufybkujyzhzffpymti.supabase.co/storage/v1/object/public/products/catalog/1791645729177_pomo_chapa_alcoba_ne.jfif',
    accentColor: '#f59e0b',
    gradient: 'from-[#111111] via-[#1c1917] to-[#1e140d]',
    ambientLight: 'rgba(245, 158, 11, 0.22)',
    highlightSpecs: ['Pestillo Ajustable 60-70mm', 'Anti-óxido', 'Uso Residencial y Comercial']
  },
  {
    id: 'prensa-av012',
    sku: 'AV012',
    slogan: 'FUERZA DE SUJECIÓN QUE NUNCA CEDE.',
    title: 'Prensa de Resorte Profesional 6"',
    subtitle: 'Mordazas Basculantes de Alta Presión',
    price: 15900,
    badge: 'TALLER & OBRA',
    refLabel: 'REF. AV012',
    usageLabel: 'Para carpintería, encolado y montaje rápido',
    link: '/product/prensa-resorte-6-pulgadas-av012',
    image: 'https://clufybkujyzhzffpymti.supabase.co/storage/v1/object/public/products/catalog/1791667955947_prensa_6_jfif.jfif',
    accentColor: '#f48f25',
    gradient: 'from-[#0d1117] via-[#161b22] to-[#1f170f]',
    ambientLight: 'rgba(244, 143, 37, 0.22)',
    highlightSpecs: ['Resorte Templado Heavy-Duty', 'Agarre Ergonómico', 'No Marca la Madera']
  }
];

export const VideoShowcaseBanner: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const SLIDE_DURATION = 6500; // 6.5s por slide para estilo video comercial
  const INTERVAL_STEP = 50;

  const currentSlide = SHOWCASE_SLIDES[currentIndex];

  // Auto-play con barra de progreso continua
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const stepPct = (INTERVAL_STEP / SLIDE_DURATION) * 100;
    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % SHOWCASE_SLIDES.length);
          return 0;
        }
        return prev + stepPct;
      });
    }, INTERVAL_STEP);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
    setProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Soporte para gestos táctiles (Swipe móvil)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <section className="py-6 sm:py-8 bg-white overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Contenedor Principal tipo Escenario / Video Comercial */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${currentSlide.gradient} border border-white/10 shadow-2xl transition-all duration-700 min-h-[580px] lg:min-h-[520px] flex flex-col justify-between`}
        >
          
          {/* Luz Ambiental / Glow cinematográfico que pulsa en el fondo */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 opacity-60"
            style={{ background: currentSlide.ambientLight }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-1000 opacity-30"
            style={{ background: currentSlide.ambientLight }}
          />

          {/* Patrón de líneas sutiles tipo estudio de video */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* BARRA SUPERIOR: Marca oficial + Botón de Play/Pausa + Contador de Escena */}
          <div className="relative z-20 px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between">
            
            {/* Logo y lema superior */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f48f25] animate-ping" />
                <span className="text-[10px] sm:text-xs font-mono font-black text-white/90 tracking-widest uppercase">
                  FERREINTER SHOWROOM
                </span>
              </div>
              <span className="hidden sm:inline-block text-white/20">|</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-400" /> Catálogo Destacado
              </span>
            </div>

            {/* Controles de reproducción tipo reproductor de video */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 hover:scale-105"
                title={isPlaying ? 'Pausar showcase' : 'Reproducir showcase'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
              </button>

              <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
                <span className="font-bold text-white">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-1 text-white/30">/</span>
                <span>{String(SHOWCASE_SLIDES.length).padStart(2, '0')}</span>
              </div>
            </div>

          </div>

          {/* CUERPO CENTRAL: Grid Responsive (Móvil vertical, Escritorio 2 columnas cinematográficas) */}
          <div className="relative z-10 px-6 sm:px-10 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
            
            {/* COLUMNA IZQUIERDA: Tipografía idéntica a la imagen del usuario */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-white">
              
              {/* Badge promocional superior */}
              <div className="inline-flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-wider uppercase bg-[#f48f25] text-black shadow-md shadow-[#f48f25]/30">
                  {currentSlide.badge}
                </span>
                <span className="text-xs font-mono font-bold text-white/60">
                  {currentSlide.refLabel}
                </span>
              </div>

              {/* SLOGAN EN NEGRITA CONDENSADA - Idéntico al arte: "EL CAMBIO ESTÁ EN LOS DETALLES" */}
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
                {currentSlide.slogan}
              </h3>

              {/* Título de producto */}
              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-bold text-white/95">
                  {currentSlide.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* RECUADRO NARANJA DE PRECIO - Estilo píldora idéntico al banner de referencia */}
              <div className="inline-flex items-center gap-3 bg-[#f48f25] text-black px-6 py-3 rounded-2xl shadow-xl shadow-[#f48f25]/30 hover:scale-[1.02] transition-transform">
                <span className="text-xs font-black uppercase tracking-wider text-black/80">
                  PRECIO:
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono leading-none">
                  ${currentSlide.price.toLocaleString('es-CO')}
                </div>
                <span className="text-xs font-extrabold uppercase font-mono tracking-wide text-black/80">
                  COP
                </span>
              </div>

              {/* Especificaciones clave rápidas */}
              <div className="flex flex-wrap gap-2 pt-1">
                {currentSlide.highlightSpecs.map((spec, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#f48f25]" />
                    {spec}
                  </span>
                ))}
              </div>

              {/* Botón de compra / ver producto */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={currentSlide.link}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f48f25] text-black font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all duration-300 hover:gap-3 group"
                >
                  <span>Ver Ficha y Comprar</span>
                  <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-[#f48f25]" />
                  <span>Explorar Todo el Catálogo</span>
                </Link>
              </div>

            </div>

            {/* COLUMNA DERECHA: Imagen en Alta Calidad con Perspectiva y Enfoque de Estudio */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* Contenedor con efecto de profundidad */}
              <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6 flex items-center justify-center group">
                
                {/* Resplandor radial detrás de la imagen */}
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-75 group-hover:scale-90 transition-transform duration-700"
                  style={{ background: currentSlide.accentColor }}
                />

                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Badge flotante inferior derecho con ubicación física oficial */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left space-y-1 shadow-xl">
                  <div className="flex items-center gap-1.5 text-[#f48f25] text-[11px] font-black tracking-wider uppercase">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ferretería Ferreinter</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/80 leading-snug">
                    Cl. 48 #56 - 05, La Candelaria &bull; Medellín
                  </p>
                  <span className="text-[10px] font-mono text-[#f48f25] block">
                    @ferreinter
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* BARRA INFERIOR: Línea de progreso de video continua + Selectores de diapositivas + Flechas */}
          <div className="relative z-20 px-6 sm:px-10 pb-6 pt-2 border-t border-white/10 space-y-3 bg-black/30 backdrop-blur-md">
            
            {/* Barra de progreso interactiva (tipo Stories / Video timeline) */}
            <div className="grid grid-cols-4 gap-2">
              {SHOWCASE_SLIDES.map((slide, idx) => {
                const isCurrent = idx === currentIndex;
                const isPast = idx < currentIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => handleSelectSlide(idx)}
                    className="group flex flex-col gap-1.5 text-left py-1 cursor-pointer focus:outline-none"
                    title={`Ver ${slide.title}`}
                  >
                    <div className="w-full h-1 sm:h-1.5 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f48f25] transition-all duration-75 rounded-full"
                        style={{
                          width: isCurrent ? `${progress}%` : isPast ? '100%' : '0%'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                      <span className={`font-bold truncate ${isCurrent ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                        {slide.sku}
                      </span>
                      <span className={`font-mono hidden sm:inline ${isCurrent ? 'text-[#f48f25]' : 'text-white/30'}`}>
                        ${(slide.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Flechas de navegación rápida */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <span>{currentSlide.usageLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#f48f25] text-white hover:text-black flex items-center justify-center transition-all border border-white/10 hover:scale-105 active:scale-95"
                  aria-label="Producto anterior"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#f48f25] text-white hover:text-black flex items-center justify-center transition-all border border-white/10 hover:scale-105 active:scale-95"
                  aria-label="Producto siguiente"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
