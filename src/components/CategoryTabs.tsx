import React from 'react';
import { CATEGORIES_DATA } from './MegaMenu';

interface TabsProps {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryTabs: React.FC<TabsProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="py-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Category Tabs matching KOSI template (Lighting / Furnitures / Decor) */}
        <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10 text-sm sm:text-base font-bold text-gray-400">
          
          <button
            onClick={() => onSelectCategory('all')}
            className={`pb-2 border-b-2 transition-all font-sans ${
              activeCategory === 'all'
                ? 'border-[#111111] text-[#111111] font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Todos los Productos
          </button>

          {CATEGORIES_DATA.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`pb-2 border-b-2 transition-all font-sans ${
                  isActive
                    ? 'border-[#f48f25] text-[#111111] font-black'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

        </div>

      </div>
    </div>
  );
};
