import React from 'react';
import { Package, DollarSign, Lightbulb, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhyChooseUsSection: React.FC = () => {
  const points = [
    {
      icon: Package,
      title: 'Variedad & Rotación',
      desc: 'Herrajes, cerraduras, discos de corte y herramientas para diferentes necesidades.',
    },
    {
      icon: DollarSign,
      title: 'Precios de Proveedor',
      desc: 'Rentabilidad real y márgenes competitivos para ferreterías y contratistas.',
    },
    {
      icon: Lightbulb,
      title: 'Asesoría Técnica Experta',
      desc: 'Te orientamos en medidas, materiales, resistencia y compatibilidad de productos.',
    },
    {
      icon: Smile,
      title: 'Garantía y Confianza',
      desc: 'Abastecimiento continuo con respaldo y calidad probada en obra.',
    },
  ];

  return (
    <section className="bg-[#f7f7f5] py-16 border-t border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-black text-[#ff5500] uppercase tracking-widest font-mono">
              PROVEEDOR FERRETERO CONFIABLE
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase">
              El Aliado Que Tu <br className="hidden sm:inline" />
              <span className="text-[#ff5500]">Negocio</span> Necesita.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Abastece tu ferretería con productos de alta rotación, precios de distribuidor directo y despacho garantizado a tiempo.
            </p>

            <div className="pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04800] text-white font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg shadow-[#ff5500]/25 transition-all transform active:scale-95 uppercase tracking-wider"
              >
                <span>Ver Portafolio Completo</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Grid 2x2 de beneficios en tarjetas estilo póster */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3 hover:border-[#ff5500]/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#ff5500]/10 text-[#ff5500] flex items-center justify-center">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h4 className="font-black text-base text-slate-900 uppercase tracking-tight">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
