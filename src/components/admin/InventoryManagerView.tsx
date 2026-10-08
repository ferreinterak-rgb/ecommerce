import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { productService } from '../../services/productService';
import { activityLogService } from '../../services/activityLogService';
import { exportProductsToExcel, exportProductsToCSV, downloadImportTemplateExcel } from '../../utils/excelService';
import {
  Package, Plus, Trash2, Edit, Search, Upload, FileSpreadsheet, FileText, Download,
  Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle, Lock, Unlock, Boxes, Layers,
  ArrowUpDown, Percent, TrendingDown, RefreshCw, CheckSquare, Square, Tag, Sparkles
} from 'lucide-react';

export type InventoryFilterType = 'all' | 'available' | 'low_stock' | 'out_of_stock' | 'private' | 'discounted' | 'featured';
export type InventorySortType = 'stock_asc' | 'stock_desc' | 'price_desc' | 'price_asc' | 'name_asc' | 'recent';

interface InventoryManagerViewProps {
  products: Product[];
  onReload: () => void;
  onEditProduct: (p: Product) => void;
  onOpenNewProduct: () => void;
  onOpenBulkImport: () => void;
  onDeleteProduct: (id: string, name: string) => void;
  userRoleName: string;
}

export const InventoryManagerView: React.FC<InventoryManagerViewProps> = ({
  products,
  onReload,
  onEditProduct,
  onOpenNewProduct,
  onOpenBulkImport,
  onDeleteProduct,
  userRoleName
}) => {
  const { formatPrice } = useCurrency();

  // Estados de Filtro y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<InventorySortType>('stock_asc');

  // Selección múltiple para acciones masivas
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // 1. Métricas / KPIs Inteligentes de Inventario
  const stats = useMemo(() => {
    let totalStock = 0;
    let inventoryValue = 0;
    let available = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let privateCount = 0;
    let discounted = 0;
    let featured = 0;

    products.forEach((p) => {
      const isPublic = p.is_active !== false;
      const stock = p.stock || 0;
      totalStock += stock;
      inventoryValue += stock * (p.discount_price ?? p.price);

      if (!isPublic) {
        privateCount++;
      } else if (stock <= 0) {
        outOfStock++;
      } else if (stock <= 10) {
        lowStock++;
      } else {
        available++;
      }

      if (p.discount_price && p.discount_price < p.price) {
        discounted++;
      }
      if (p.is_featured) {
        featured++;
      }
    });

    return {
      total: products.length,
      totalStock,
      inventoryValue,
      available,
      lowStock,
      outOfStock,
      privateCount,
      discounted,
      featured
    };
  }, [products]);

  // 2. Extraer Categorías y Marcas dinámicamente con conteos
  const { categoryList, brandList } = useMemo(() => {
    const catMap: Record<string, number> = {};
    const brandMap: Record<string, number> = {};

    products.forEach((p) => {
      if (p.category) {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      }
      if (p.brand) {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      }
    });

    return {
      categoryList: Object.entries(catMap).map(([cat, count]) => ({ cat, count })),
      brandList: Object.entries(brandMap).map(([brand, count]) => ({ brand, count }))
    };
  }, [products]);

  // 3. Filtrar y Ordenar Productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isPublic = p.is_active !== false;
      const stock = p.stock || 0;

      // Filtro de Estado
      if (statusFilter === 'available') {
        if (!isPublic || stock <= 10) return false;
      } else if (statusFilter === 'low_stock') {
        if (!isPublic || stock <= 0 || stock > 10) return false;
      } else if (statusFilter === 'out_of_stock') {
        if (stock > 0) return false;
      } else if (statusFilter === 'private') {
        if (isPublic) return false;
      } else if (statusFilter === 'discounted') {
        if (!p.discount_price || p.discount_price >= p.price) return false;
      } else if (statusFilter === 'featured') {
        if (!p.is_featured) return false;
      }

      // Filtro por Categoría
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Filtro por Marca
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      // Búsqueda en Vivo (SKU, Nombre, Marca, Categoría, Material, Dimensión)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = [
          p.name,
          p.sku,
          p.brand,
          p.category,
          p.dimensions || '',
          p.materials || '',
          p.description || ''
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'stock_asc') return (a.stock || 0) - (b.stock || 0); // Urgencia: menor stock primero
      if (sortBy === 'stock_desc') return (b.stock || 0) - (a.stock || 0); // Para mover inventario con mayor stock
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [products, statusFilter, selectedCategory, selectedBrand, searchQuery, sortBy]);

  // Selección individual o total
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Rápido de Privado / Público (Visibilidad)
  const handleToggleVisibility = async (product: Product) => {
    const newStatus = product.is_active === false ? true : false;
    try {
      await productService.saveProduct({
        ...product,
        is_active: newStatus
      });
      await activityLogService.logAction(
        newStatus ? 'Publicación de Producto' : 'Ocultamiento de Producto (Privado)',
        'Inventario',
        product.sku,
        `Se cambió el estado a ${newStatus ? 'PÚBLICO' : 'PRIVADO'}`,
        userRoleName
      );
      onReload();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
    }
  };

  // Ajuste rápido de Stock
  const handleQuickStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      await productService.saveProduct({
        ...product,
        stock: newStock,
        stock_warehouse: Math.max(0, (product.stock_warehouse ?? 0) + delta)
      });
      onReload();
    } catch (err) {
      console.error('Error al actualizar stock:', err);
    }
  };

  // Acciones Masivas
  const handleBulkAction = async (action: 'hide' | 'activate' | 'discount20' | 'addStock50' | 'delete') => {
    if (selectedIds.length === 0) return;
    setIsProcessingAction(true);

    try {
      const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

      if (action === 'delete') {
        if (confirm(`¿Estás seguro de eliminar los ${selectedProducts.length} productos seleccionados?`)) {
          for (const p of selectedProducts) {
            await productService.deleteProduct(p.id);
          }
          setSelectedIds([]);
          onReload();
        }
        setIsProcessingAction(false);
        return;
      }

      const updates: Partial<Product>[] = selectedProducts.map((p) => {
        if (action === 'hide') {
          return { ...p, is_active: false };
        } else if (action === 'activate') {
          return { ...p, is_active: true };
        } else if (action === 'discount20') {
          return {
            ...p,
            discount_price: Math.round(p.price * 0.8) // 20% de descuento para mover inventario
          };
        } else if (action === 'addStock50') {
          return {
            ...p,
            stock: (p.stock || 0) + 50,
            stock_warehouse: (p.stock_warehouse || 0) + 50
          };
        }
        return p;
      });

      await productService.bulkUpsertProducts(updates);
      await activityLogService.logAction(
        'Acción Masiva de Inventario',
        'Inventario',
        `${selectedProducts.length} productos`,
        `Acción ejecutada: ${action}`,
        userRoleName
      );

      setSelectedIds([]);
      onReload();
    } catch (err: any) {
      alert(`Error en acción masiva: ${err?.message || err}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* 1. Header con Título y Botonera Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-[#f48f25]/20 text-[#d97706] font-bold px-2 py-0.5 rounded-full">
              Control Maestro
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Valor Inventario: <strong className="text-slate-900">{formatPrice(stats.inventoryValue)}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Gestión Inteligente de Inventario
          </h2>
          <p className="text-xs text-gray-500">
            Organiza por categorías, filtra por disponibilidad, mueve existencias y gestiona productos privados o en liquidación.
          </p>
        </div>

        {/* Botonera de Acciones Comerciales */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBulkImport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title="Importar catálogo masivamente desde Excel o CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#f48f25]" />
            <span>Importar Masivo</span>
          </button>

          <button
            onClick={() => exportProductsToExcel(products)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="Exportar inventario en archivo Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => exportProductsToCSV(products)}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            title="Exportar en CSV"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={downloadImportTemplateExcel}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            title="Descargar plantilla de Excel modelo"
          >
            <Download className="w-3.5 h-3.5 text-[#f48f25]" />
            <span>Plantilla</span>
          </button>

          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2.5 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs hover:bg-[#d97706] flex items-center gap-1.5 shadow-md shadow-[#f48f25]/30 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Estado de Inventario (Clickables como Filtro Rápido) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-black text-white border-black shadow-md'
              : 'bg-white text-slate-800 border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total SKUs</span>
            <Boxes className="w-4 h-4 opacity-60" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.total}</div>
          <span className="text-[10px] opacity-70">{stats.totalStock.toLocaleString()} un. totales</span>
        </button>

        {/* Disponibles */}
        <button
          onClick={() => setStatusFilter('available')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'available'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50/50 text-emerald-950 border-emerald-100 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'available' ? 'text-white' : ''}`}>
              Disponibles
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.available}</div>
          <span className={`text-[10px] ${statusFilter === 'available' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Stock saludable (&gt;10)
          </span>
        </button>

        {/* A punto de agotarse */}
        <button
          onClick={() => setStatusFilter('low_stock')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'low_stock'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/50 text-amber-950 border-amber-100 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'low_stock' ? 'text-white' : ''}`}>
              Por Agotarse
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.lowStock}</div>
          <span className={`text-[10px] ${statusFilter === 'low_stock' ? 'text-amber-100' : 'text-amber-700'}`}>
            Crítico (1 a 10 un.)
          </span>
        </button>

        {/* Agotados */}
        <button
          onClick={() => setStatusFilter('out_of_stock')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'out_of_stock'
              ? 'bg-rose-700 text-white border-rose-700 shadow-md'
              : 'bg-rose-50/50 text-rose-950 border-rose-100 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'out_of_stock' ? 'text-white' : ''}`}>
              Agotados
            </span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.outOfStock}</div>
          <span className={`text-[10px] ${statusFilter === 'out_of_stock' ? 'text-rose-100' : 'text-rose-700'}`}>
            Stock en cero (0)
          </span>
        </button>

        {/* Privados / Ocultos */}
        <button
          onClick={() => setStatusFilter('private')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'private'
              ? 'bg-purple-800 text-white border-purple-800 shadow-md'
              : 'bg-purple-50/50 text-purple-950 border-purple-100 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-purple-700">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'private' ? 'text-white' : ''}`}>
              Privados / Ocultos
            </span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.privateCount}</div>
          <span className={`text-[10px] ${statusFilter === 'private' ? 'text-purple-100' : 'text-purple-700'}`}>
            No visibles en tienda
          </span>
        </button>

        {/* En Oferta / Liquidación */}
        <button
          onClick={() => setStatusFilter('discounted')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'discounted'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-gray-50 text-slate-800 border-gray-100 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-[#f48f25]">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'discounted' ? 'text-white' : 'text-slate-800'}`}>
              En Oferta
            </span>
            <Percent className="w-4 h-4" />
          </div>
          <div className="text-xl font-black mt-1 font-mono">{stats.discounted}</div>
          <span className="text-[10px] opacity-70">Descuento activo</span>
        </button>
      </div>

      {/* 3. Barra de Filtros Inteligentes: Categoría + Marca + Buscador + Ordenamiento */}
      <div className="bg-[#f8f7f5] p-4 rounded-2xl border border-gray-100 space-y-3">
        
        {/* Fila Superior: Buscador y Selectores de Categoría y Marca */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          
          {/* Buscador en Vivo */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por SKU, Nombre, Marca, Medida, Material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-gray-400 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-gray-200 focus:outline-none focus:border-black shadow-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold p-0.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Selectores de Categoría, Marca y Orden */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Organizar por Categoría */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-slate-700">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas ({products.length})</option>
                {categoryList.map(({ cat, count }) => (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtrar por Marca */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-slate-700">Marca:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas</option>
                {brandList.map(({ brand, count }) => (
                  <option key={brand} value={brand}>
                    {brand} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenamiento de Movilidad de Inventario */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-slate-700">Mover por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="stock_asc">Menor Stock (Reabastecer urgente)</option>
                <option value="stock_desc">Mayor Stock (Promociones/Liquidación)</option>
                <option value="price_desc">Mayor Precio</option>
                <option value="price_asc">Menor Precio</option>
                <option value="name_asc">Nombre: A - Z</option>
                <option value="recent">Más Recientes</option>
              </select>
            </div>

          </div>

        </div>

        {/* Fila Inferior: Píldoras de Filtro Rápido de Estado */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Filtro rápido:
            </span>

            {[
              { id: 'all', label: 'Todos', count: stats.total },
              { id: 'available', label: 'Disponibles', count: stats.available },
              { id: 'low_stock', label: 'Por Agotarse', count: stats.lowStock },
              { id: 'out_of_stock', label: 'Agotados', count: stats.outOfStock },
              { id: 'private', label: 'Privados', count: stats.privateCount },
              { id: 'discounted', label: 'En Oferta', count: stats.discounted },
              { id: 'featured', label: 'Destacados', count: stats.featured },
            ].map((f) => {
              const active = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as InventoryFilterType)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-gray-500 text-xs font-medium">
            Mostrando <strong className="text-slate-900">{filteredProducts.length}</strong> de <strong className="text-slate-900">{products.length}</strong>
          </div>
        </div>

      </div>

      {/* 4. Barra Flotante de Acciones Masivas (Aparece cuando hay items seleccionados) */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-[#f48f25]">
              {selectedIds.length}
            </div>
            <div>
              <p className="font-bold text-xs">
                {selectedIds.length} {selectedIds.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </p>
              <p className="text-[10px] text-gray-400">Aplica cambios de inventario masivamente</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={isProcessingAction}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Hacer visibles en la tienda"
            >
              <Eye className="w-3.5 h-3.5" /> Hacer Públicos
            </button>

            <button
              onClick={() => handleBulkAction('hide')}
              disabled={isProcessingAction}
              className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ocultar de la tienda (hacer privados)"
            >
              <Lock className="w-3.5 h-3.5" /> Hacer Privados
            </button>

            <button
              onClick={() => handleBulkAction('discount20')}
              disabled={isProcessingAction}
              className="px-3 py-1.5 rounded-lg bg-[#f48f25] hover:bg-[#d97706] text-black font-extrabold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Aplicar 20% de descuento para mover inventario"
            >
              <Percent className="w-3.5 h-3.5" /> Descuento 20% OFF
            </button>

            <button
              onClick={() => handleBulkAction('addStock50')}
              disabled={isProcessingAction}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sumar 50 unidades al stock"
            >
              <Plus className="w-3.5 h-3.5" /> +50 Stock
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessingAction}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-[11px] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 5. Tabla de Gestión de Inventario */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#031834] text-white uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer accent-[#f48f25]"
                    title="Seleccionar todos"
                  />
                </th>
                <th className="p-3.5">Producto</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Precio Venta (COP)</th>
                <th className="p-3.5">Precio Mayor</th>
                <th className="p-3.5 text-center">Stock & Movilidad</th>
                <th className="p-3.5 text-center">Estado / Visibilidad</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400 space-y-2">
                    <Boxes className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="font-bold text-slate-700">No se encontraron productos con estos filtros.</p>
                    <p className="text-[11px]">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  const isPublic = p.is_active !== false;
                  const stock = p.stock || 0;
                  const isLow = isPublic && stock > 0 && stock <= 10;
                  const isOut = stock <= 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isChecked ? 'bg-amber-50/30' : ''
                      } ${!isPublic ? 'bg-gray-50/40 opacity-75' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(p.id)}
                          className="w-4 h-4 rounded cursor-pointer accent-[#f48f25]"
                        />
                      </td>

                      {/* Info Producto */}
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <img
                            src={p.images[0] || '/dewalt-chopsaw.jpg'}
                            alt={p.name}
                            className="w-11 h-11 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200"
                          />
                          <button
                            onClick={() => onEditProduct(p)}
                            className="absolute inset-0 bg-black/50 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                            title="Cambiar Foto"
                          >
                            Foto
                          </button>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#f48f25] font-bold uppercase">{p.brand}</span>
                            {p.dimensions && (
                              <span className="text-[10px] text-gray-400 font-mono">[{p.dimensions}]</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5 font-mono text-gray-500 font-semibold">{p.sku}</td>

                      {/* Categoría */}
                      <td className="p-3.5 font-semibold text-gray-700 capitalize">{p.category}</td>

                      {/* Precios */}
                      <td className="p-3.5 font-bold text-slate-900 font-mono">
                        {formatPrice(p.price)}
                        {p.discount_price && (
                          <span className="block text-[10px] text-emerald-600 font-normal">
                            Oferta: {formatPrice(p.discount_price)}
                          </span>
                        )}
                      </td>

                      {/* Precio Mayorista */}
                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {p.wholesale_price ? formatPrice(p.wholesale_price) : <span className="text-gray-400 font-normal">-</span>}
                      </td>

                      {/* Stock con Controles Rápidos de Movilidad (+ / -) */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleQuickStockChange(p, -1)}
                            disabled={stock <= 0}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs transition-colors disabled:opacity-30 cursor-pointer"
                            title="Restar 1 unidad"
                          >
                            -
                          </button>
                          
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {stock} un.
                          </span>

                          <button
                            onClick={() => handleQuickStockChange(p, 10)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="Sumar 10 unidades rápidamente"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                          B:{p.stock_warehouse ?? 0} | T:{p.stock_store ?? 0} | W:{p.stock_online ?? 0}
                        </div>
                      </td>

                      {/* Estado y Visibilidad (Público vs Privado con Toggle Directo) */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Badge de Visibilidad */}
                          <button
                            onClick={() => handleToggleVisibility(p)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isPublic
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            }`}
                            title={isPublic ? 'Clic para ocultar de la tienda (Hacer Privado)' : 'Clic para publicar en la tienda (Hacer Público)'}
                          >
                            {isPublic ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Público</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-purple-600" />
                                <span>Privado</span>
                              </>
                            )}
                          </button>

                          {/* Badge de Estado de Stock */}
                          {isOut ? (
                            <span className="text-[10px] font-extrabold text-rose-600 uppercase">Agotado</span>
                          ) : isLow ? (
                            <span className="text-[10px] font-extrabold text-amber-600 uppercase">Por Agotarse</span>
                          ) : null}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Editar producto completo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
