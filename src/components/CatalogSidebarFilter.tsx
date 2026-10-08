import React from 'react';
import { SlidersHorizontal, RotateCcw, Check, Star, Layers, Box, Tag } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  selectedBrands: string[];
  selectedMaterials: string[];
  selectedDimensions: string[];
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  minRating: number;
}

export interface OptionCount {
  name: string;
  count: number;
}

interface CatalogSidebarFilterProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categoryCounts: Record<string, number>;
  totalProductsCount: number;
  availableBrands: OptionCount[];
  availableMaterials: OptionCount[];
  availableDimensions: OptionCount[];
  maxCatalogPrice: number;
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
  { id: 'herrajes-carpinteria', name: 'Herrajes de Carpintería' },
];

export const CatalogSidebarFilter: React.FC<CatalogSidebarFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categoryCounts,
  totalProductsCount,
  availableBrands,
  availableMaterials,
  availableDimensions,
  maxCatalogPrice
}) => {
  const { formatPrice } = useCurrency();

  const handleBrandToggle = (brand: string) => {
    const current = filters.selectedBrands;
    const exists = current.includes(brand);
    const updated = exists ? current.filter((b) => b !== brand) : [...current, brand];
    onFilterChange({ selectedBrands: updated });
  };

  const handleMaterialToggle = (mat: string) => {
    const current = filters.selectedMaterials;
    const exists = current.includes(mat);
    const updated = exists ? current.filter((m) => m !== mat) : [...current, mat];
    onFilterChange({ selectedMaterials: updated });
  };

  const handleDimensionToggle = (dim: string) => {
    const current = filters.selectedDimensions;
    const exists = current.includes(dim);
    const updated = exists ? current.filter((d) => d !== dim) : [...current, dim];
    onFilterChange({ selectedDimensions: updated });
  };

  return (
    <aside className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 sticky top-28 font-sans">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black">
            <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Filtros Inteligentes</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors font-medium"
          title="Restablecer filtros"
        >
          <RotateCcw className="w-3 h-3" /> Limpiar
        </button>
      </div>

      {/* 1. Categorías */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono text-gray-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Categorías
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
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-[#f5f5f7] hover:text-slate-900 font-medium'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-white text-black font-bold' : 'bg-gray-100 text-gray-500'
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
          <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400">
            Precio Máximo
          </h4>
          <span className="text-xs font-bold text-slate-900 font-mono">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max={Math.max(maxCatalogPrice, 300000)}
          step="1000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-black cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>{formatPrice(1000)}</span>
          <span>{formatPrice(Math.max(maxCatalogPrice, 300000))}</span>
        </div>
      </div>

      {/* 3. Marcas Dinámicas */}
      {availableBrands.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Marcas ({availableBrands.length})
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map(({ name: brand, count }) => {
              const checked = filters.selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  onClick={() => handleBrandToggle(brand)}
                  className="flex items-center justify-between cursor-pointer group text-xs text-slate-800 py-1 px-1.5 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? 'bg-black border-black text-white'
                          : 'border-gray-300 group-hover:border-black'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="font-medium group-hover:text-black transition-colors">{brand}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Materiales & Acabados Dinámicos */}
      {availableMaterials.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" /> Material / Acabado
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {availableMaterials.map(({ name: mat, count }) => {
              const checked = filters.selectedMaterials.includes(mat);
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => handleMaterialToggle(mat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    checked
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${checked ? 'bg-white' : 'bg-gray-300'}`} />
                  <span className="max-w-[140px] truncate">{mat}</span>
                  <span className={`text-[9px] ${checked ? 'text-gray-300' : 'text-gray-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Medidas & Dimensiones Dinámicas */}
      {availableDimensions.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400">
            Medida / Dimensión
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {availableDimensions.map(({ name: dim, count }) => {
              const checked = filters.selectedDimensions.includes(dim);
              return (
                <button
                  key={dim}
                  type="button"
                  onClick={() => handleDimensionToggle(dim)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                    checked
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span>{dim}</span>
                  <span className={`text-[9px] ml-1 ${checked ? 'text-gray-300' : 'text-gray-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Disponibilidad & Ofertas */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400">
          Disponibilidad & Ofertas
        </h4>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyDiscounted}
              onChange={(e) => onFilterChange({ onlyDiscounted: e.target.checked })}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <span className="font-medium text-slate-800">Solo en Oferta / Descuento</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyInStock}
              onChange={(e) => onFilterChange({ onlyInStock: e.target.checked })}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <span className="font-medium text-slate-800">Solo con Stock Inmediato</span>
          </label>
        </div>
      </div>

      {/* 7. Calificación Mínima */}
      <div className="space-y-3 border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400">
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
                  isSelected ? 'bg-black text-white font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                  ))}
                  <span className={`text-xs ml-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>{stars} Estrellas</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
