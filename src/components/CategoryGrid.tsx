import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const categories = [
    {
      id: 'herramientas-electricas',
      title: 'HERRAMIENTAS ELÉCTRICAS',
      subtitle: 'Herramientas de precisión para cada trabajo',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]',
        titleColor: 'text-white',
        subtitleColor: 'text-gray-300',
        btnBg: 'bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold',
      },
    },
    {
      id: 'herramientas-manuales',
      title: 'HERRAMIENTAS MANUALES',
      subtitle: 'Resistencia, control & ergonomía profesional',
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-[#f8f7f5] border border-gray-200/80',
        titleColor: 'text-slate-900',
        subtitleColor: 'text-gray-600',
        btnBg: 'bg-[#111111] hover:bg-[#f48f25] text-white hover:text-black font-extrabold',
      },
    },
    {
      id: 'plomeria',
      title: 'PLOMERÍA & FONTANERÍA',
      subtitle: 'Build, Fix, Create — Soluciones hidráulicas',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-gradient-to-r from-[#111111] via-[#1c1917] to-[#111111]',
        titleColor: 'text-white',
        subtitleColor: 'text-gray-400',
        btnBg: 'bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold',
      },
    },
    {
      id: 'pintura-supplies',
      title: 'PINTURA & ACABADOS',
      subtitle: 'Suministros de cobertura & protección profesional',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-slate-950',
        titleColor: 'text-white',
        subtitleColor: 'text-amber-100',
        btnBg: 'bg-white hover:bg-[#111111] text-black hover:text-white font-extrabold',
      },
    },
    {
      id: 'electricidad',
      title: 'ELECTRICIDAD & ILUMINACIÓN',
      subtitle: 'Instalaciones seguras & eficiencia energética',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-[#1c1917]',
        titleColor: 'text-white',
        subtitleColor: 'text-gray-300',
        btnBg: 'bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold',
      },
    },
    {
      id: 'seguridad-herrajes',
      title: 'HERRAJES & SEGURIDAD',
      subtitle: 'Cerraduras & protección para hogar y negocio',
      image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
      theme: {
        bg: 'bg-gradient-to-r from-slate-200 via-gray-200 to-slate-300 border border-gray-300',
        titleColor: 'text-slate-900',
        subtitleColor: 'text-slate-700',
        btnBg: 'bg-[#111111] hover:bg-[#f48f25] text-white hover:text-black font-extrabold',
      },
    },
  ];

  return (
    <section className="bg-white py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#f48f25] uppercase tracking-wider font-mono">
              CATEGORÍAS DESTACADAS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Explorar Categorías de Productos
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#f48f25] flex items-center gap-1 transition-colors"
          >
            Ver Catálogo Completo <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Category Banners Grid (Matching media_1789845703156.png) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-3xl overflow-hidden p-8 sm:p-10 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[300px] relative group ${cat.theme.bg}`}
            >
              
              {/* Left Side Tools Flat-lay Image */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-left mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-current opacity-90" />
              </div>

              {/* Right Side Typography Content (Matching media_1789845703156.png) */}
              <div className="relative z-10 space-y-3 max-w-sm ml-auto text-right flex flex-col items-end">
                
                <h3 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${cat.theme.titleColor}`}>
                  {cat.title}
                </h3>

                <p className={`text-xs sm:text-sm font-medium leading-relaxed ${cat.theme.subtitleColor}`}>
                  {cat.subtitle}
                </p>

                {/* Direct "IR A LA CATEGORÍA" Button */}
                <div className="pt-4">
                  <Link
                    to={`/catalog?category=${cat.id}`}
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95 uppercase tracking-wide ${cat.theme.btnBg}`}
                  >
                    <span>Ir a la Categoría</span>
                    <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
