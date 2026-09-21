import React from 'react';
import { Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-white py-14 border-t border-gray-100 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#f48f25] uppercase tracking-wider font-mono">
            TESTIMONIOS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </div>

        {/* Yellow Circle Quote Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[#f48f25] flex items-center justify-center text-black font-black shadow">
            <Quote className="w-5 h-5 fill-black" />
          </div>
        </div>

        {/* Quote text */}
        <blockquote className="text-base sm:text-lg text-gray-700 font-medium italic max-w-2xl mx-auto leading-relaxed">
          "¡Excelente servicio al cliente y entrega muy rápida! La calidad de las herramientas es sobresaliente. Recomiendo totalmente esta tienda."
        </blockquote>

        <div className="pt-2">
          <p className="font-bold text-xs sm:text-sm text-slate-900">Carlos E. Mendoza</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider">Cliente Verificado</p>
        </div>

      </div>
    </section>
  );
};
