import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const EditorialHeroBanner: React.FC = () => {
  return (
    <section className="py-6 sm:py-10 bg-[#f7f7f5] relative overflow-hidden">
      
      {/* Decorative Warm Shapes en las esquinas inspiradas en el arte */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 sm:w-72 sm:h-72 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Contenedor tipo Póster Editorial con Marco de Esquinas Curvas suaves */}
        <div className="relative bg-[#fafaf8] border border-black/[0.08] rounded-[32px] sm:rounded-[44px] p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          
          {/* Sello Geométrico en el ángulo superior derecho */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 w-28 h-28 sm:w-40 sm:h-40 bg-[#ff5500] transform rotate-45 rounded-3xl opacity-90 shadow-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* COLUMNA IZQUIERDA: Tipografía Editorial y Llamado de Negocio */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              
              {/* Badge Superior */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Proveedor Líder de Ferretería & Construcción</span>
              </div>

              {/* Titular Principal: "TU NEGOCIO NECESITA UN BUEN PROVEEDOR." */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] uppercase">
                TU NEGOCIO <br />
                NECESITA UN <br />
                BUEN <span className="text-[#ff5500]">PROVEEDOR.</span>
              </h1>

              {/* Subtítulo / Bajada textual del concepto gráfico */}
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                Abastece tu ferretería, taller u obra con productos de alta rotación y calidad certificada para diferentes necesidades.
              </p>

              {/* Puntos clave de valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Precios Mayoristas Inmediatos</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Stock Disponible en Bodega</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Garantía de Fábrica Directa</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Despacho Rápido a Todo el País</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="bg-[#ff5500] hover:bg-[#e04800] text-white font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-xl shadow-[#ff5500]/30 hover:shadow-2xl transition-all transform active:scale-95 flex items-center gap-2.5 tracking-wider uppercase group"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/booking"
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm px-7 py-4 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 tracking-wide"
                >
                  <span>Cotización por Mayor</span>
                </Link>
              </div>

            </div>

            {/* COLUMNA DERECHA: Escenario Visual con el Fondo Naranja y Herramientas del Arte */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* Marco Fotográfico estilo Póster */}
              <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
                
                {/* Imagen del arte gráfico del usuario */}
                <img
                  src="/banner-proveedor-ferreinter.jpg"
                  alt="Tu negocio necesita un buen proveedor - Ferreinter"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Badge flotante inferior con dirección física oficial */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-white flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#ff5500] font-black tracking-widest block">
                      DISTRIBUIDOR AUTORIZADO
                    </span>
                    <span className="text-xs font-bold text-white block">
                      Ferretería Ferreinter • Medellín
                    </span>
                  </div>
                  <Link
                    to="/catalog"
                    className="px-3.5 py-1.5 rounded-xl bg-[#ff5500] hover:bg-[#e04800] text-white font-extrabold text-[11px] uppercase tracking-wide transition-colors shrink-0"
                  >
                    Ver Stock
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
