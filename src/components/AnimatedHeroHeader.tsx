import React from 'react';
import { Link } from 'react-router-dom';

export const AnimatedHeroHeader: React.FC = () => {
  return (
    <div className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* KOSI 3-Box Mosaic Feature Banner with exact #f8f7f5 container backgrounds matching media_1789822912698.jpg */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Big Feature Box Left (Savendo / DeWalt Chop Saw) */}
          <div className="lg:col-span-6 bg-[#f8f7f5] rounded-3xl p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[420px] border border-gray-100 shadow-sm">
            
            {/* Top Studio Image */}
            <div className="w-full h-64 flex items-center justify-center p-4">
              <img
                src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800"
                alt="Tronzadora DeWalt"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
              />
            </div>

            {/* Bottom Title & Shop Now link matching Savendo box */}
            <div className="mt-4 text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
                DeWalt 20V XR
              </h2>
              <Link
                to="/catalog?category=herramientas-electricas"
                className="inline-block mt-1 text-xs font-black text-slate-900 uppercase tracking-wider underline underline-offset-4 hover:text-[#f48f25] transition-colors"
              >
                Shop Now
              </Link>
            </div>

          </div>

          {/* Right Column with 2 Stacked Feature Boxes matching Sofia & Levando */}
          <div className="lg:col-span-6 grid grid-rows-2 gap-6">
            
            {/* Top Right Box (Sofia / Herramientas Manuales) */}
            <div className="bg-[#f8f7f5] rounded-3xl p-6 lg:p-8 flex items-center justify-between group overflow-hidden border border-gray-100 shadow-sm">
              <div className="space-y-1 text-left">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  Herramientas Manuales
                </h3>
                <Link
                  to="/catalog?category=herramientas-manuales"
                  className="inline-block text-xs font-black text-slate-900 uppercase tracking-wider underline underline-offset-4 hover:text-[#f48f25] transition-colors"
                >
                  Shop Now
                </Link>
              </div>

              <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=400"
                  alt="Herramientas Manuales"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Bottom Right Box (Levando / Plomería & Fontanería) */}
            <div className="bg-[#f8f7f5] rounded-3xl p-6 lg:p-8 flex items-center justify-between group overflow-hidden border border-gray-100 shadow-sm">
              <div className="space-y-1 text-left">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  Plomería & Fontanería
                </h3>
                <Link
                  to="/catalog?category=plomeria-y-fontaneria"
                  className="inline-block text-xs font-black text-slate-900 uppercase tracking-wider underline underline-offset-4 hover:text-[#f48f25] transition-colors"
                >
                  Shop Now
                </Link>
              </div>

              <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"
                  alt="Plomería & Fontanería"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
