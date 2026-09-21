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
import { Package, Plus, Trash2, Edit, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isCollaborator } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Inventario & Productos</h2>
                <p className="text-xs text-gray-500 mt-1">Crea, edita o elimina productos del catálogo comercial.</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs hover:bg-[#d97706] flex items-center gap-2 shadow-md shadow-[#f48f25]/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Registrar Nuevo Producto
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#031834] text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Producto</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio USD</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Destacado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1" />
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-[#f48f25] font-bold uppercase">{p.brand}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-gray-500">{p.sku}</td>
                      <td className="p-4 font-semibold text-gray-700">{p.category}</td>
                      
                      <td className="p-4 font-bold text-slate-900">
                        {formatPrice(p.discount_price ?? p.price)}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.stock} un.
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {p.is_featured ? (
                          <span className="bg-[#f48f25]/20 text-[#d97706] text-[10px] font-black px-2 py-0.5 rounded-full">
                            SI
                          </span>
                        ) : <span className="text-gray-400 text-[10px]">NO</span>}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Editar"
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

    </div>
  );
};
