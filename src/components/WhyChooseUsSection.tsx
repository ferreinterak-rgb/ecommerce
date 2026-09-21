import React from 'react';
import { Package, DollarSign, Lightbulb, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhyChooseUsSection: React.FC = () => {
  const points = [
    {
      icon: Package,
      title: 'Productos de Calidad',
      desc: 'Solo vendemos productos de la mejor calidad de marcas de gran confianza.',
    },
    {
      icon: DollarSign,
      title: 'Precios Accesibles',
      desc: 'Obtén el mejor valor por tu dinero con nuestros precios altamente competitivos.',
    },
    {
      icon: Lightbulb,
      title: 'Asesoría de Expertos',
      desc: 'Nuestro equipo de especialistas técnicos siempre está listo para ayudarte.',
    },
    {
      icon: Smile,
      title: 'Satisfacción Garantizada',
      desc: 'Nos comprometemos con tu satisfacción total en cada compra y servicio.',
    },
  ];

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold text-[#f48f25] uppercase tracking-wider font-mono">
              POR QUÉ ELEGIRNOS
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Brindamos Lo Mejor <br className="hidden sm:inline" />
              Para Tu Proyecto
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Nos comprometemos a proporcionar a nuestros clientes productos de la más alta calidad, precios competitivos y una atención profesional de primera.
            </p>

            <div>
              <Link
                to="/booking"
                className="inline-block bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-md transition-colors"
              >
                Saber Más
              </Link>
            </div>
          </div>

          {/* Right Column 2x2 Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((pt, idx) => {
              const IconComp = pt.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-3 hover:border-[#f48f25]/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] border border-[#f48f25]/20 flex items-center justify-center text-[#f48f25]">
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{pt.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{pt.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
