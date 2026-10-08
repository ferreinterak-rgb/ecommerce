import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { productService } from '../services/productService';

export const BestSellersGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getProducts().then((all) => {
      const active = all.filter((p) => p.is_active !== false);
      const featured = active.filter((p) => p.is_featured);
      const displayList = featured.length >= 4 ? featured : active;
      setProducts(displayList.slice(0, 8));
    });
  }, []);

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f48f25]/10 text-[#f48f25] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Productos Destacados
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
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

        {/* 4-Column Grid with completely frameless ProductCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
