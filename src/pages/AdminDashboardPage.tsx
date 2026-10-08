import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { OrderKanbanBoard } from '../components/admin/OrderKanbanBoard';
import { ProductRegistrationForm } from '../components/admin/ProductRegistrationForm';
import { OrderDetailModal } from '../components/admin/OrderDetailModal';
import { TeamManagementView } from '../components/admin/TeamManagementView';
import { AuditLogsView } from '../components/admin/AuditLogsView';

import { Product, Order, OrderStatus } from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { appointmentService } from '../services/appointmentService';
import { activityLogService } from '../services/activityLogService';
import { Package, Plus, Trash2, Edit, ShieldAlert, CheckCircle2, Download, Upload, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { BulkImportModal } from '../components/admin/BulkImportModal';
import { exportProductsToExcel, exportProductsToCSV, downloadImportTemplateExcel } from '../utils/excelService';

export const AdminDashboardPage: React.FC = () => {
  const { user, isCollaborator } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords, apps] = await Promise.all([
        productService.getProducts(),
        orderService.getOrders(),
        appointmentService.getAppointments()
      ]);
      setProducts(prods);
      setOrders(ords);
      setAppointmentsCount(apps.length);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const saved = await productService.saveProduct(productData);
    await activityLogService.logAction(
      editingProduct ? 'Modificación de Producto' : 'Creación de Producto',
      'Producto',
      saved.sku,
      `Producto: ${saved.name} - Precio: $${saved.price} USD`,
      user?.full_name || 'Admin'
    );
    loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      await productService.deleteProduct(id);
      await activityLogService.logAction(
        'Eliminación de Producto',
        'Producto',
        id,
        `Se eliminó el producto ${name}`,
        user?.full_name || 'Admin'
      );
      loadData();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, status);
    await activityLogService.logAction(
      'Actualización de Estado de Pedido',
      'Pedido',
      orderId,
      `Nuevo estado: ${status.toUpperCase()}`,
      user?.full_name || 'Admin'
    );
    loadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  if (!isCollaborator) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Acceso Restringido</h2>
        <p className="text-xs text-gray-500">
          Tu cuenta actual no posee permisos de Administrador o Colaborador. Cambia tu rol a <strong>Admin</strong> desde el menú superior para acceder al panel.
        </p>
      </div>
    );
  }

  const totalSalesUSD = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar Component */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Admin Content View */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            ordersCount={orders.length}
            totalSalesUSD={totalSalesUSD}
            productsCount={products.length}
            appointmentsCount={appointmentsCount}
          />
        )}

        {activeTab === 'orders' && (
          <OrderKanbanBoard
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onSelectOrder={(order) => setSelectedOrder(order)}
          />
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Primary Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Inventario & Productos</h2>
                <p className="text-xs text-gray-500 mt-1">Crea, edita o importa y exporta masivamente tu catálogo comercial.</p>
              </div>

              {/* Botonera de Acciones Masivas y Registro */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                  title="Cargar productos masivamente desde Excel o CSV"
                >
                  <Upload className="w-4 h-4 text-[#f48f25]" />
                  <span>Importar Masivo</span>
                </button>

                <button
                  onClick={() => exportProductsToExcel(products)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                  title="Descargar todo el inventario en formato Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  onClick={() => exportProductsToCSV(products)}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Descargar en formato CSV plano"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={downloadImportTemplateExcel}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Descargar plantilla de Excel con formato y ejemplos"
                >
                  <Download className="w-4 h-4 text-[#f48f25]" />
                  <span>Plantilla</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs hover:bg-[#d97706] flex items-center gap-2 shadow-md shadow-[#f48f25]/30 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Producto
                </button>
              </div>
            </div>

            {/* Barra de Búsqueda Rápida en Inventario */}
            <div className="bg-[#f8f7f5] p-3.5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Buscar por SKU, Nombre, Marca o Categoría..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-gray-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-[#f48f25] shadow-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="text-gray-500 font-medium">
                Mostrando <strong className="text-slate-900">
                  {products.filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(productSearchQuery.toLowerCase())).length}
                </strong> de <strong className="text-slate-900">{products.length}</strong> productos
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#031834] text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Precio Venta (COP)</th>
                    <th className="p-3.5">Precio Por Mayor</th>
                    <th className="p-3.5 text-center">Stock (Bod / Tda / Web)</th>
                    <th className="p-3.5">Dimensiones & Material</th>
                    <th className="p-3.5 text-center">Destacado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products
                    .filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
                    .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-11 h-11 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200" />
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="absolute inset-0 bg-black/50 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                            title="Cambiar Foto"
                          >
                            Foto
                          </button>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-[#f48f25] font-bold uppercase">{p.brand}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-gray-500 font-semibold">{p.sku}</td>
                      <td className="p-3.5 font-semibold text-gray-700 capitalize">{p.category}</td>
                      
                      <td className="p-3.5 font-bold text-slate-900 font-mono">
                        {formatPrice(p.price)}
                        {p.discount_price && (
                          <span className="block text-[10px] text-emerald-600 font-normal">
                            Oferta: {formatPrice(p.discount_price)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {p.wholesale_price ? formatPrice(p.wholesale_price) : <span className="text-gray-400 font-normal">-</span>}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.stock} un.
                        </span>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                          B:{p.stock_warehouse ?? 0} | T:{p.stock_store ?? 0} | W:{p.stock_online ?? 0}
                        </div>
                      </td>

                      <td className="p-3.5 text-gray-600">
                        {p.dimensions && <span className="font-bold block text-[10px] text-slate-800">{p.dimensions}</span>}
                        {p.materials && <span className="text-[10px] text-gray-400 block">{p.materials}</span>}
                        {!p.dimensions && !p.materials && <span className="text-gray-300">-</span>}
                      </td>

                      <td className="p-3.5 text-center">
                        {p.is_featured ? (
                          <span className="bg-[#f48f25]/20 text-[#d97706] text-[10px] font-black px-2 py-0.5 rounded-full">
                            SI
                          </span>
                        ) : <span className="text-gray-400 text-[10px]">NO</span>}
                      </td>

                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Editar producto y fotos"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {activeTab === 'team' && <TeamManagementView />}
        {activeTab === 'logs' && <AuditLogsView />}

      </main>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <ProductRegistrationForm
          productToEdit={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          setIsBulkImportOpen(false);
          loadData();
        }}
        existingProducts={products}
      />

    </div>
  );
};
