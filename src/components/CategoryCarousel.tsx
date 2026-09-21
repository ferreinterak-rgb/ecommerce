import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap, Hammer, Droplet, Paintbrush, Cpu, ShieldCheck } from 'lucide-react';

const DISPLAY_CATEGORIES = [
  {
    name: 'Herramientas Eléctricas',
    slug: 'herramientas-electricas',
    count: '45 Productos',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Herramientas Manuales',
    slug: 'herramientas-manuales',
    count: '32 Productos',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Plomería & Fontanería',
    slug: 'plomeria-y-fontaneria',
    count: '28 Productos',
    icon: Droplet,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Pintura & Acabados',
    slug: 'pintura-y-acabados',
    count: '20 Productos',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Electricidad',
    slug: 'electricidad-e-iluminacion',
    count: '30 Productos',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Seguridad & Herrajes',
    slug: 'construccion-y-seguridad',
    count: '25 Productos',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400'
  }
];

export const CategoryCarousel: React.FC = () => {
  return (
    <section className="py-8 bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f48f25]">
              CATEGORÍAS DE ESPECIALIDAD
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Explorar por Línea de Producto
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-slate-900 hover:text-[#f48f25] flex items-center gap-1 transition-colors group"
          >
            Ver Todo <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid matching reference card layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DISPLAY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={`/catalog?category=${cat.slug}`}
                className="group glass-card-white p-5 rounded-[24px] hover:border-[#f48f25]/50 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 mb-3 rounded-2xl bg-gray-100 p-2.5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
                <div className="p-1.5 rounded-full bg-[#f48f25] text-black mb-2 shadow-sm">
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-[#f48f25] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-500 font-mono mt-1 font-semibold">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
