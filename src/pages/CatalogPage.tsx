import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { CatalogSidebarFilter, FilterState } from '../components/CatalogSidebarFilter';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initial Filter State from URL
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    maxPrice: 500,
    selectedBrands: [],
    onlyDiscounted: false,
    onlyInStock: false,
    minRating: 0,
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [searchInputValue, setSearchInputValue] = useState<string>(initialSearch);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (e) {
        console.error('Error fetching catalog products', e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
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

  const resetFilters = () => {
    setFilters({
      category: 'all',
      maxPrice: 500,
      selectedBrands: [],
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

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    const query = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();

    return products.filter(p => {
      // 1. Category
      if (filters.category !== 'all' && p.category !== filters.category) return false;

      // 2. Price
      const price = p.discount_price ?? p.price;
      if (price > filters.maxPrice) return false;

      // 3. Brands
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) return false;

      // 4. Discounted only
      if (filters.onlyDiscounted && (!p.discount_price || p.discount_price >= p.price)) return false;

      // 5. Stock
      if (filters.onlyInStock && p.stock <= 0) return false;

      // 6. Rating
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;

      // 7. Search Query
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discount_price ?? a.price;
      const priceB = b.discount_price ?? b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, filters, sortBy, searchParams]);

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-bold text-[#f48f25] uppercase tracking-wider font-mono">
              CATÁLOGO FERREINTER
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Ferretería & Soluciones Industriales
            </h1>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-[#111111] text-white font-bold text-xs px-5 py-3 rounded-full flex items-center gap-2 self-start shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#f48f25]" />
            <span>Filtros Inteligentes</span>
          </button>
        </div>

        {/* Main Layout: Left Sidebar (3 cols) + Right Grid (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filter (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <CatalogSidebarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
              categoryCounts={categoryCounts}
              totalProductsCount={products.length}
            />
          </div>

          {/* Right Main Catalog Content (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar Search & Sort */}
            <div className="bg-[#f8f7f5] p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              
              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Buscar por taladro, tornillo, marca..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-gray-400 text-xs rounded-xl pl-4 pr-9 py-2.5 border border-gray-200 focus:outline-none focus:border-[#f48f25] shadow-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f48f25]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Counter & Sorting */}
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-gray-500 font-medium hidden sm:inline">
                  Mostrando <strong className="text-slate-900">{filteredProducts.length}</strong> productos
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold focus:border-[#f48f25] focus:outline-none text-xs text-slate-900 shadow-sm"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor Calificados</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Product Cards Grid (3 Columns on Desktop) */}
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
                  Prueba seleccionando otra categoría, ajustando el precio máximo o limpiando la búsqueda.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-full bg-[#111111] hover:bg-[#f48f25] hover:text-black text-white font-bold text-xs uppercase tracking-wider transition-colors"
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

      {/* Mobile Drawer Filter Modal */}
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
              onFilterChange={(updated) => {
                handleFilterChange(updated);
              }}
              onResetFilters={() => {
                resetFilters();
                setMobileFilterOpen(false);
              }}
              categoryCounts={categoryCounts}
              totalProductsCount={products.length}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CatalogPage;
