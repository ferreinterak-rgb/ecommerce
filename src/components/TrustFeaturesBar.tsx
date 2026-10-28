import React from 'react';
import { Truck, ShieldCheck, Award, Headset } from 'lucide-react';

export const TrustFeaturesBar: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Despacho Rápido y Seguro',
      desc: 'Envíos a todo el país',
    },
    {
      icon: ShieldCheck,
      title: 'Proveedor Confiable',
      desc: 'Calidad industrial garantizada',
    },
    {
      icon: Award,
      title: 'Precios para Negocios',
      desc: 'Tarifas mayoristas competitivas',
    },
    {
      icon: Headset,
      title: 'Asesoría Técnica',
      desc: 'Atención personalizada directa',
    },
  ];

  return (
    <section className="bg-[#f7f7f5] py-6 border-b border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-black/[0.05] shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#ff5500]/10 text-[#ff5500] flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
