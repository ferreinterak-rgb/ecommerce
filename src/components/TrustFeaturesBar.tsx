import React from 'react';
import { Truck, ShieldCheck, Award, Headset } from 'lucide-react';

export const TrustFeaturesBar: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Envío Rápido y Gratis',
      desc: 'En compras mayores a $500.000',
    },
    {
      icon: ShieldCheck,
      title: 'Pago 100% Seguro',
      desc: 'Transacciones protegidas',
    },
    {
      icon: Award,
      title: 'Productos de Alta Calidad',
      desc: 'Las mejores marcas garantizadas',
    },
    {
      icon: Headset,
      title: 'Soporte 24/7',
      desc: 'Atención personalizada',
    },
  ];

  return (
    <section className="bg-white py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-3">
                <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-slate-900 shrink-0">
                  <IconComponent className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
