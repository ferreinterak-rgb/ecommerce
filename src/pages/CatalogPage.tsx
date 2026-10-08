import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { CatalogSidebarFilter, FilterState, OptionCount } from '../components/CatalogSidebarFilter';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { isCategoryMatch } from '../utils/resilience';
import { useCurrency } from '../context/CurrencyContext';

const normalizeStr = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initial Filter State from URL
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 500000,
    selectedBrands: [],
    selectedMaterials: [],
    selectedDimensions: [],
    onlyDiscounted: false,
    onlyInStock: false,
    minRating: 0,
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'stock-high'>('featured');
  const [searchInputValue, setSearchInputValue] = useState<string>(initialSearch);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        setProducts(data);
        // Ajustar maxPrice inicial al máximo real si existe
        if (data.length > 0) {
          const maxP = Math.max(...data.map(p => p.discount_price ?? p.price));
          setFilters(prev => ({ ...prev, maxPrice: Math.max(maxP, 300000) }));
        }
      } catch (e) {
        console.error('Error fetching catalog products', e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const handleSync = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      }
    };
    window.addEventListener('ferre_products_synced', handleSync);
    return () => window.removeEventListener('ferre_products_synced', handleSync);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || searchParams.get('search') || '';
    setFilters(prev => ({ ...prev, category: cat }));
    setSearchInputValue(q);
  }, [searchParams]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters(prev => {
      const next = { ...prev, ...updated };
      if (updated.category !== undefined) {
        if (updated.category === 'all') {
          searchParams.delete('category');
        } else {
          searchParams.set('category', updated.category);
        }
        setSearchParams(searchParams);
      }
      return next;
    });
  };

  const maxCatalogPrice = useMemo(() => {
    if (products.length === 0) return 300000;
    return Math.max(...products.map(p => p.discount_price ?? p.price));
  }, [products]);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: Math.max(maxCatalogPrice, 300000),
      selectedBrands: [],
      selectedMaterials: [],
      selectedDimensions: [],
      onlyDiscounted: false,
      onlyInStock: false,
      minRating: 0,
    });
    setSearchInputValue('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      searchParams.set('q', searchInputValue.trim());
    } else {
      searchParams.delete('q');
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    searchParams.delete('q');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  // Dinámicamente calcular conteos y opciones disponibles de todo el catálogo
  const { categoryCounts, availableBrands, availableMaterials, availableDimensions } = useMemo(() => {
    const catCounts: Record<string, number> = {};
    const brandMap: Record<string, number> = {};
    const matMap: Record<string, number> = {};
    const dimMap: Record<string, number> = {};

    products.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;

      if (p.brand) {
        const b = p.brand.trim();
        brandMap[b] = (brandMap[b] || 0) + 1;
      }
      if (p.materials) {
        const m = p.materials.trim();
        matMap[m] = (matMap[m] || 0) + 1;
      }
      if (p.dimensions) {
        const d = p.dimensions.trim();
        dimMap[d] = (dimMap[d] || 0) + 1;
      }
    });

    const toOptionList = (map: Record<string, number>): OptionCount[] =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return {
      categoryCounts: catCounts,
      availableBrands: toOptionList(brandMap),
      availableMaterials: toOptionList(matMap),
      availableDimensions: toOptionList(dimMap)
    };
  }, [products]);

  // Filtrado y Ordenamiento Inteligente
  const filteredProducts = useMemo(() => {
    const query = normalizeStr(searchInputValue.trim());
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];

    return products.filter(p => {
      // 1. Categoría
      if (filters.category !== 'all' && !isCategoryMatch(p.category, filters.category)) return false;

      // 2. Rango de Precio
      const price = p.discount_price ?? p.price;
      if (price > filters.maxPrice) return false;

      // 3. Marcas
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) return false;

      // 4. Materiales
      if (filters.selectedMaterials.length > 0 && (!p.materials || !filters.selectedMaterials.includes(p.materials))) return false;

      // 5. Dimensiones
      if (filters.selectedDimensions.length > 0 && (!p.dimensions || !filters.selectedDimensions.includes(p.dimensions))) return false;

      // 6. Descuento
      if (filters.onlyDiscounted && (!p.discount_price || p.discount_price >= p.price)) return false;

      // 7. Stock
      if (filters.onlyInStock && p.stock <= 0) return false;

      // 8. Calificación
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;

      // 9. Buscador inteligente multitermino
      if (queryTokens.length > 0) {
        const searchableContent = normalizeStr([
          p.name,
          p.sku,
          p.brand,
          p.category,
          p.materials || '',
          p.dimensions || '',
          p.description || ''
        ].join(' '));

        const matchesAllTokens = queryTokens.every(token => searchableContent.includes(token));
        if (!matchesAllTokens) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discount_price ?? a.price;
      const priceB = b.discount_price ?? b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'stock-high') return b.stock - a.stock;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, filters, sortBy, searchInputValue]);

  // Contar cuántos filtros activos tenemos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < maxCatalogPrice) count++;
    count += filters.selectedBrands.length;
    count += filters.selectedMaterials.length;
    count += filters.selectedDimensions.length;
    if (filters.onlyDiscounted) count++;
    if (filters.onlyInStock) count++;
    if (filters.minRating > 0) count++;
    if (searchInputValue.trim()) count++;
    return count;
  }, [filters, searchInputValue, maxCatalogPrice]);

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-bold text-black uppercase tracking-wider font-mono">
              CATÁLOGO FERREINTER
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Ferretería & Soluciones Industriales
            </h1>
          </div>

          {/* Botón Filtros Móvil con badge */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-black text-white font-bold text-xs px-5 py-3 rounded-full flex items-center gap-2 self-start shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#f48f25]" />
            <span>Filtros Inteligentes</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#f48f25] text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Layout: Sidebar Izquierdo (3 cols) + Grid Principal (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <CatalogSidebarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
              categoryCounts={categoryCounts}
              totalProductsCount={products.length}
              availableBrands={availableBrands}
              availableMaterials={availableMaterials}
              availableDimensions={availableDimensions}
              maxCatalogPrice={maxCatalogPrice}
            />
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Barra Superior: Buscador y Ordenamiento */}
            <div className="bg-[#f8f7f5] p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              
              {/* Buscador inteligente */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Buscar por tornillo, bisagra, 35mm, DeWalt, acero..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-gray-400 text-xs rounded-xl pl-9 pr-9 py-2.5 border border-gray-200 focus:outline-none focus:border-black shadow-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchInputValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold p-1"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Contador y Selector de Orden */}
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-gray-500 font-medium hidden sm:inline">
                  Mostrando <strong className="text-slate-900">{filteredProducts.length}</strong> de {products.length} productos
                </span>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-bold text-slate-800">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold focus:border-black focus:outline-none text-xs text-slate-900 shadow-sm"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                    <option value="name-asc">Nombre: A - Z</option>
                    <option value="name-desc">Nombre: Z - A</option>
                    <option value="stock-high">Mayor Disponibilidad</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Píldoras de Filtros Activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Filtros activos:
                </span>

                {searchInputValue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
                    Búsqueda: "{searchInputValue}"
                    <button onClick={handleClearSearch} className="hover:text-[#f48f25] ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.category !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Categoría: {filters.category}
                    <button onClick={() => handleFilterChange({ category: 'all' })} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedBrands.map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Marca: {b}
                    <button
                      onClick={() => handleFilterChange({ selectedBrands: filters.selectedBrands.filter(x => x !== b) })}
                      className="hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.selectedMaterials.map(m => (
                  <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Material: {m}
                    <button
                      onClick={() => handleFilterChange({ selectedMaterials: filters.selectedMaterials.filter(x => x !== m) })}
                      className="hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.selectedDimensions.map(d => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Medida: {d}
                    <button
                      onClick={() => handleFilterChange({ selectedDimensions: filters.selectedDimensions.filter(x => x !== d) })}
                      className="hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.maxPrice < maxCatalogPrice && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Hasta {formatPrice(filters.maxPrice)}
                    <button onClick={() => handleFilterChange({ maxPrice: maxCatalogPrice })} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.onlyDiscounted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    Solo Ofertas
                    <button onClick={() => handleFilterChange({ onlyDiscounted: false })} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.onlyInStock && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    En Stock
                    <button onClick={() => handleFilterChange({ onlyInStock: false })} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f4] text-slate-800 text-xs font-semibold">
                    {filters.minRating}★ o más
                    <button onClick={() => handleFilterChange({ minRating: 0 })} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold underline ml-2 cursor-pointer"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Grid de Productos */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-[#f8f7f5] rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#f8f7f5] p-12 text-center rounded-3xl border border-gray-100 space-y-4">
                <p className="text-lg font-bold text-slate-900">No se encontraron productos con estos filtros.</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Prueba cambiando los términos de búsqueda, aumentando el precio o quitando las marcas seleccionadas.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Restablecer Todos los Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Drawer Móvil para Filtros */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Filtros Inteligentes</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <CatalogSidebarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={() => {
                resetFilters();
                setMobileFilterOpen(false);
              }}
              categoryCounts={categoryCounts}
              totalProductsCount={products.length}
              availableBrands={availableBrands}
              availableMaterials={availableMaterials}
              availableDimensions={availableDimensions}
              maxCatalogPrice={maxCatalogPrice}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CatalogPage;
