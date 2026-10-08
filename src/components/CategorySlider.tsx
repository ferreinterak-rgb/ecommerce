import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ArrowUpRight, 
  Package, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Disc,
  Wrench,
  Ruler,
  FolderOpen
} from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  fallbackImage: string;
  badgeTag: string;
  accentBg: string;
}

const CATEGORY_METADATA: CategoryConfig[] = [
  {
    id: 'bisagras',
    name: 'Bisagras Especializadas',
    description: 'Acero inoxidable 304, cierre lento, parche, semiparche y superacodadas',
    fallbackImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Top Ventas',
    accentBg: 'from-amber-500/10 to-orange-500/10',
  },
  {
    id: 'chapas',
    name: 'Chapas & Cerraduras',
    description: 'Cerraduras de pomo, manija tubular, sobreponer, reja y seguridad Lock Prime',
    fallbackImage: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Seguridad',
    accentBg: 'from-slate-700/10 to-zinc-800/10',
  },
  {
    id: 'discos-corte',
    name: 'Discos de Corte & Pulido',
    description: 'Discos para madera y aluminio de 10" con dientes de carburo de tungsteno',
    fallbackImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Corte Limpio',
    accentBg: 'from-red-500/10 to-orange-600/10',
  },
  {
    id: 'prensas-fijacion',
    name: 'Prensas de Sujeción',
    description: 'Prensas rápidas de resorte de 3" a 9" y prensas angulares para armado',
    fallbackImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Taller',
    accentBg: 'from-amber-600/10 to-yellow-600/10',
  },
  {
    id: 'brocas-accesorios',
    name: 'Brocas & Perforación',
    description: 'Brocas multipropósito Forza, topes de profundidad y avellanadores',
    fallbackImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Perforación',
    accentBg: 'from-blue-600/10 to-cyan-600/10',
  },
  {
    id: 'escuadras-medicion',
    name: 'Escuadras de Medición',
    description: 'Escuadras de aluminio profesionales 7" y 12" de precisión para carpintería',
    fallbackImage: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Precisión',
    accentBg: 'from-emerald-600/10 to-teal-600/10',
  },
  {
    id: 'placas-reparacion',
    name: 'Placas de Reparación',
    description: 'Placas en acero inoxidable para rescate y refuerzo de bisagras en muebles',
    fallbackImage: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Refuerzo',
    accentBg: 'from-purple-600/10 to-indigo-600/10',
  },
  {
    id: 'herrajes-carpinteria',
    name: 'Herrajes de Carpintería',
    description: 'Accesorios y adaptadores especializados para armado y fijación de muebles',
    fallbackImage: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    badgeTag: 'Especializado',
    accentBg: 'from-stone-600/10 to-neutral-700/10',
  },
];

export const CategorySlider: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productService.getProducts().then(data => {
      setProducts(data);
    });

    const handleSync = (e: any) => {
      if (e.detail) setProducts(e.detail);
    };
    window.addEventListener('ferre_products_synced', handleSync);
    return () => window.removeEventListener('ferre_products_synced', handleSync);
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = sliderRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        current.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Categorías calculadas con conteo real y fotos de productos reales
  const categoryCards = CATEGORY_METADATA.map(meta => {
    const categoryProducts = products.filter(p => p.category === meta.id);
    const count = categoryProducts.length;

    // Buscar si algún producto tiene una foto real subida a Storage (https://)
    const productWithCloudImg = categoryProducts.find(
      p => p.images && p.images.some(img => img.startsWith('https://') && !img.includes('unsplash.com'))
    );
    const realImg = productWithCloudImg?.images?.[0];

    // O tomar la primera foto disponible de los productos de esa categoría
    const sampleImg = realImg || categoryProducts[0]?.images?.[0] || meta.fallbackImage;

    // Calcular precio mínimo
    const validPrices = categoryProducts.map(p => p.price).filter(pr => pr > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

    return {
      ...meta,
      count,
      displayImage: sampleImg,
      minPrice,
      productsSample: categoryProducts.slice(0, 3)
    };
  }).filter(c => c.count > 0 || products.length === 0);

  return (
    <section className="bg-gradient-to-b from-white via-slate-50/50 to-white py-14 font-sans border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Encabezado con Título y Controles del Slider */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f48f25]/10 text-[#f48f25] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Categorías de Inventario Real
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explora Nuestro Catálogo por Categoría
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Navega por nuestras líneas especializadas en herrajes, cerraduras, discos de corte y herramientas de sujeción técnica.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-[#f48f25] flex items-center gap-1 transition-colors mr-2"
            >
              Ver Catálogo Completo <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            {/* Botones de navegación del carrusel */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Categoría anterior"
                aria-label="Categoría anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Siguiente categoría"
                aria-label="Siguiente categoría"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Track del Slider Horizontal */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryCards.map((cat) => (
            <div
              key={cat.id}
              className="w-[280px] sm:w-[320px] lg:w-[350px] shrink-0 snap-start group"
            >
              <div className="h-full bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between p-5 relative">
                
                {/* Zona Superior: Badge y Conteo Real */}
                <div className="flex items-center justify-between mb-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                    {cat.badgeTag}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {cat.count} {cat.count === 1 ? 'producto' : 'productos'}
                  </span>
                </div>

                {/* Imagen Representativa del Producto de la Categoría */}
                <Link
                  to={`/catalog?category=${cat.id}`}
                  className="relative aspect-4/3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center p-4 mb-4 group-hover:scale-[1.02] transition-transform duration-300 block"
                >
                  <img
                    src={cat.displayImage}
                    alt={cat.name}
                    className="w-full h-full object-contain filter group-hover:drop-shadow-md transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = cat.fallbackImage;
                    }}
                  />
                  
                  {/* Gradiente sutil decorativo */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.accentBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                </Link>

                {/* Contenido Textual */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight group-hover:text-[#f48f25] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {cat.description}
                    </p>
                  </div>

                  {/* Precios & Botón de Acción */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                    <div>
                      {cat.minPrice ? (
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Desde</span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {formatPrice(cat.minPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">Ver Catálogo</span>
                      )}
                    </div>

                    <Link
                      to={`/catalog?category=${cat.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-[#f48f25] text-white hover:text-black font-extrabold text-xs transition-all shadow-sm hover:shadow-md group/btn"
                    >
                      <span>Ver Productos</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Barra de llamada a la acción inferior */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#f48f25]/20 text-[#f48f25] flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold">
                ¿Buscas una referencia técnica o medida específica?
              </p>
              <p className="text-[11px] text-slate-400">
                Usa nuestros filtros inteligentes por disponibilidad, categoría o busca por código SKU en el catálogo.
              </p>
            </div>
          </div>

          <Link
            to="/catalog"
            className="px-5 py-2.5 rounded-xl bg-[#f48f25] hover:bg-[#d97706] text-black font-extrabold text-xs tracking-wide uppercase transition-colors shrink-0"
          >
            Abrir Filtros & Catálogo
          </Link>
        </div>

      </div>
    </section>
  );
};
