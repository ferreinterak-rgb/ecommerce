import React from 'react';
import { Link } from 'react-router-dom';
import { Play as PlayIcon, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="bg-[#f5f5f7] py-14 lg:py-24 border-b border-gray-200/60 overflow-hidden relative">
      
      {/* Background Decorative Pill Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#f48f25]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f48f25] animate-ping" />
              <span className="text-xs font-extrabold text-slate-900 tracking-wider uppercase font-mono">
                FERRETERÍA DE MÁXIMA CALIDAD
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Todo Lo Que Necesitas <br className="hidden sm:inline" />
              <span className="text-[#f48f25]">Para Tu Próximo Proyecto</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed font-medium">
              Herramientas de máxima calidad, materiales de construcción y artículos de ferretería profesional: todo en un solo lugar con envíos a todo el país.
            </p>

            {/* Pill Action Buttons matching UI Kit Kit */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/catalog"
                className="bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 tracking-wide uppercase"
              >
                <span>Comprar Ahora</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>

              <button
                onClick={() => alert("Reproduciendo video corporativo de FERREINTER")}
                className="flex items-center gap-3 bg-white hover:bg-gray-100 text-slate-900 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md transition-all border border-gray-200 group"
              >
                <span className="w-8 h-8 rounded-full bg-[#f48f25] flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-sm">
                  <PlayIcon className="w-4 h-4 fill-black ml-0.5" />
                </span>
                <span>Ver Video</span>
              </button>
            </div>
          </div>

          {/* Right Column Isolated Image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative overflow-hidden group">
                <img
                  src="/dewalt-chopsaw.jpg"
                  alt="Ferretería y Tronzadora Profesional"
                  className="w-full h-auto object-contain max-h-[460px] group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                />
                
                {/* Float Badge */}
                <div className="absolute bottom-6 left-6 bg-[#111111] text-white px-5 py-2.5 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f48f25]" />
                  <span>Serie Profesional DeWalt</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
