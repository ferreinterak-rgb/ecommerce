import React from 'react';
import { Link } from 'react-router-dom';

export const PromoBanner: React.FC = () => {
  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] rounded-2xl overflow-hidden relative grid grid-cols-1 lg:grid-cols-12 items-center min-h-[300px]">
          
          {/* Left Text */}
          <div className="lg:col-span-6 p-8 sm:p-12 space-y-5 z-10">
            <span className="text-xs font-bold text-[#f48f25] tracking-widest uppercase font-mono">
              OFERTA ESPECIAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-md">
              Obtén Hasta un 20% De Descuento En Productos Seleccionados
            </h2>
            <div>
              <Link
                to="/catalog"
                className="inline-block bg-[#f48f25] hover:bg-[#e07d18] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-md shadow transition-colors"
              >
                Comprar Ahora
              </Link>
            </div>
          </div>

          {/* Right Image & Yellow Badge */}
          <div className="lg:col-span-6 h-full relative flex items-center justify-end">
            {/* Hexagon / Circle Yellow Discount Badge */}
            <div className="absolute top-6 right-6 lg:top-8 lg:left-8 bg-[#f48f25] text-black font-black text-xs sm:text-sm w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center shadow-lg z-20 border-2 border-white/20 transform rotate-12">
              <span className="text-[10px] leading-tight font-bold">AHORRA</span>
              <span className="text-base sm:text-lg font-black leading-none">20%</span>
            </div>

            <img
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80"
              alt="Herramientas Oferta Especial"
              className="w-full h-64 lg:h-full object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
