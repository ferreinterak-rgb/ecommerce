import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

export const BestSellersGrid: React.FC = () => {
  const DEWALT_CHOPSAW_IMAGE = '/dewalt-chopsaw.jpg';

  const products: Product[] = [
    {
      id: 'dewalt-chop-saw-14',
      name: 'Tronzadora de Metales DeWalt 14" 2200W (Chop Saw)',
      slug: 'tronzadora-de-metales-dewalt-14-2200w',
      brand: 'DeWalt',
      sku: 'D28730-14IN',
      description: 'Tronzadora de disco de 14 pulgadas con motor de alto rendimiento de 2200W y prensa de ajuste rápido.',
      price: 219.0,
      discount_price: 189.99,
      category: 'herramientas-electricas',
      stock: 18,
      images: [DEWALT_CHOPSAW_IMAGE],
      is_featured: true,
      is_active: true,
      rating: 5,
      reviews_count: 54,
      created_at: new Date().toISOString()
    },
    {
      id: 'dewalt-drill-20v',
      name: 'Taladro Percutor Inalámbrico DeWalt 20V Max XR Brushless',
      slug: 'taladro-percutor-dewalt-20v-max',
      brand: 'DeWalt',
      sku: 'DCD996B-20V',
      description: 'Taladro percutor con motor sin carbones (Brushless), 3 velocidades y mandril metálico de 1/2 pulgada.',
      price: 199.0,
      discount_price: 179.99,
      category: 'herramientas-electricas',
      stock: 24,
      images: [DEWALT_CHOPSAW_IMAGE],
      is_featured: true,
      is_active: true,
      rating: 5,
      reviews_count: 42,
      created_at: new Date().toISOString()
    },
    {
      id: 'stanley-tape-25ft',
      name: 'Flexómetro Stanley PowerLock 25ft con Traba Automática',
      slug: 'cinta-metrica-stanley-powerlock-25ft',
      brand: 'Stanley',
      sku: 'ST-33-425',
      description: 'Cinta métrica profesional de 25 pies con recubrimiento de Mylar para máxima durabilidad.',
      price: 25.0,
      discount_price: 21.99,
      category: 'herramientas-manuales',
      stock: 120,
      images: [DEWALT_CHOPSAW_IMAGE],
      is_featured: true,
      is_active: true,
      rating: 5,
      reviews_count: 128,
      created_at: new Date().toISOString()
    },
    {
      id: 'craftsman-wrench-set',
      name: 'Juego de Llaves Mixtas Craftsman 20 Piezas Métrico y SAE',
      slug: 'juego-de-llaves-craftsman-20-piezas',
      brand: 'Craftsman',
      sku: 'CMMT12034',
      description: 'Juego completo de llaves combinadas de acero cromo vanadio forjado a presión.',
      price: 80.0,
      discount_price: 69.99,
      category: 'herramientas-manuales',
      stock: 30,
      images: [DEWALT_CHOPSAW_IMAGE],
      is_featured: true,
      is_active: true,
      rating: 5,
      reviews_count: 88,
      created_at: new Date().toISOString()
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#f48f25] uppercase tracking-wider font-mono">
              PRODUCTOS DESTACADOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Los Más Vendidos
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#f48f25] flex items-center gap-1 transition-colors"
          >
            Ver Todos los Productos <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Spacious 4-Column Grid for Premium E-commerce UX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
