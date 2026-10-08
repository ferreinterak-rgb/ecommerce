import React from 'react';
import { SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export interface FilterState {
  category: string;
  maxPrice: number;
  selectedBrands: string[];
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  minRating: number;
}

interface CatalogSidebarFilterProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categoryCounts: Record<string, number>;
  totalProductsCount: number;
}

const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos' },
  { id: 'bisagras', name: 'Bisagras Especializadas' },
  { id: 'chapas', name: 'Chapas & Cerraduras' },
  { id: 'discos-corte', name: 'Discos de Corte' },
  { id: 'prensas-fijacion', name: 'Prensas de Sujeción' },
  { id: 'brocas-accesorios', name: 'Brocas & Perforación' },
  { id: 'escuadras-medicion', name: 'Escuadras de Medición' },
  { id: 'placas-reparacion', name: 'Placas de Reparación' },
];

const BRANDS = ['LOCK PRIME', 'FORZA', 'GATO', 'PANTHERS', 'KL', 'FGV', 'FERREINTER'];

export const CatalogSidebarFilter: React.FC<CatalogSidebarFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categoryCounts,
  totalProductsCount,
}) => {
  const { formatPrice } = useCurrency();

  const handleBrandToggle = (brand: string) => {
    const current = filters.selectedBrands;
    const exists = current.includes(brand);
    const updated = exists ? current.filter((b) => b !== brand) : [...current, brand];
    onFilterChange({ selectedBrands: updated });
  };

  return (
    <aside className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-7 sticky top-28 font-sans">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-[#f48f25]">
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
          </div>
          <h3 className="font-black text-base text-slate-900 tracking-tight">Filtros Inteligentes</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-gray-400 hover:text-[#f48f25] flex items-center gap-1 transition-colors font-medium"
          title="Restablecer filtros"
        >
          <RotateCcw className="w-3 h-3" /> Limpiar
        </button>
      </div>

      {/* 1. Categorías */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono text-gray-400">
          Categorías
        </h4>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat.id;
            const count = cat.id === 'all' ? totalProductsCount : categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-[#f5f5f7] hover:text-slate-900 font-medium'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#f48f25] text-black font-bold' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rango de Precio */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
            Rango de Precio
          </h4>
          <span className="text-xs font-bold text-slate-900 font-mono">
            hasta {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-[#f48f25] cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>{formatPrice(10)}</span>
          <span>{formatPrice(500)}</span>
        </div>
      </div>

      {/* 3. Marcas */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
          Marcas Destacadas
        </h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => {
            const checked = filters.selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center justify-between cursor-pointer group text-xs text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => handleBrandToggle(brand)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checked
                        ? 'bg-[#111111] border-[#111111] text-white'
                        : 'border-gray-300 group-hover:border-[#f48f25]'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium group-hover:text-[#f48f25] transition-colors">{brand}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Disponibilidad & Ofertas */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
          Estado del Producto
        </h4>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyDiscounted}
              onChange={(e) => onFilterChange({ onlyDiscounted: e.target.checked })}
              className="w-4 h-4 accent-[#f48f25] rounded cursor-pointer"
            />
            <span className="font-medium text-slate-800">Solo en Oferta (-20%)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyInStock}
              onChange={(e) => onFilterChange({ onlyInStock: e.target.checked })}
              className="w-4 h-4 accent-[#f48f25] rounded cursor-pointer"
            />
            <span className="font-medium text-slate-800">Disponible para envío inmediato</span>
          </label>
        </div>
      </div>

      {/* 5. Calificación Mínima */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
          Calificación
        </h4>
        <div className="space-y-1.5">
          {[5, 4, 3].map((stars) => {
            const isSelected = filters.minRating === stars;
            return (
              <button
                key={stars}
                onClick={() => onFilterChange({ minRating: isSelected ? 0 : stars })}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                  isSelected ? 'bg-[#f5f5f7] border border-[#f48f25]/40 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[#f48f25]">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#f48f25] stroke-none" />
                  ))}
                  <span className="text-slate-800 text-xs ml-1">{stars} Estrellas</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
