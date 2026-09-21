import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldAlert, Cpu, Droplet, Hammer, Zap, ArrowRight } from 'lucide-react';

export const CATEGORIES_DATA = [
  {
    id: 'herramientas-electricas',
    name: 'Herramientas Eléctricas',
    slug: 'herramientas-electricas',
    icon: Zap,
    description: 'Taladros, esmeriladoras, sierras e inalámbricos de alta potencia.',
    itemCount: 45
  },
  {
    id: 'herramientas-manuales',
    name: 'Herramientas Manuales',
    slug: 'herramientas-manuales',
    icon: Hammer,
    description: 'Llaves, martillos, alicates y juegos profesionales.',
    itemCount: 32
  },
  {
    id: 'plomeria-y-fontaneria',
    name: 'Plomería y Fontanería',
    slug: 'plomeria-y-fontaneria',
    icon: Droplet,
    description: 'Tuberías, grifería industrial, conexiones y bombas de agua.',
    itemCount: 28
  },
  {
    id: 'pintura-y-acabados',
    name: 'Pintura y Acabados',
    slug: 'pintura-y-acabados',
    icon: Wrench,
    description: 'Esmaltes, impermeabilizantes, rodillos y compresores de pintura.',
    itemCount: 20
  },
  {
    id: 'electricidad-e-iluminacion',
    name: 'Electricidad e Iluminación',
    slug: 'electricidad-e-iluminacion',
    icon: Cpu,
    description: 'Cableado, tableros eléctricos, focos LED e interruptores smart.',
    itemCount: 30
  },
  {
    id: 'construccion-y-seguridad',
    name: 'Seguridad & Herrajes',
    slug: 'construccion-y-seguridad',
    icon: ShieldAlert,
    description: 'EPP, cascos, arneses, escaleras y cerraduras digitales.',
    itemCount: 25
  }
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full z-40 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-[28px] p-6 shadow-2xl text-slate-900">
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-[#f48f25]" />
              Catálogo General de Categorías
            </h3>
            <Link
              to="/catalog"
              onClick={onClose}
              className="text-xs font-bold text-gray-500 hover:text-[#f48f25] flex items-center gap-1 transition-colors"
            >
              Ver todo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CATEGORIES_DATA.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  onClick={onClose}
                  className="group flex items-start p-3 rounded-2xl hover:bg-gray-100/80 transition-all border border-transparent hover:border-[#f48f25]/40"
                >
                  <div className="p-2.5 rounded-xl bg-[#f48f25] text-black shadow-sm group-hover:scale-105 transition-transform mr-3 mt-0.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#f48f25] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {cat.description}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-[#f48f25] mt-1 inline-block">
                      {cat.itemCount} Disponibles
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
