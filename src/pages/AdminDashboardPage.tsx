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
import { ShieldAlert } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { BulkImportModal } from '../components/admin/BulkImportModal';
import { InventoryManagerView } from '../components/admin/InventoryManagerView';

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

    // Escuchar actualizaciones en tiempo real de productos
    const handleSync = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      }
    };
    window.addEventListener('ferre_products_synced', handleSync);
    return () => window.removeEventListener('ferre_products_synced', handleSync);
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const saved = await productService.saveProduct(productData);

    // Actualización reactiva inmediata en la tabla (0 ms) sin esperar recarga
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id || p.sku === saved.sku);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    await activityLogService.logAction(
      editingProduct ? 'Modificación de Producto' : 'Creación de Producto',
      'Producto',
      saved.sku,
      `Producto: ${saved.name} - Precio: $${saved.price} COP`,
      user?.full_name || 'Admin'
    );
    loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
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
      <div className="min-h-screen bg-[#010e21] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#031834] p-8 rounded-3xl border border-red-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Acceso Restringido</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Esta sección administrativa es estrictamente confidencial. Se requiere una sesión activa con el único usuario autorizado en Supabase.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/login"
              className="py-3 px-6 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs hover:bg-[#d97706] transition-all"
            >
              Iniciar Sesión en Supabase
            </a>
            <a
              href="/"
              className="py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Volver a la Tienda
            </a>
          </div>
        </div>
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
            orders={orders}
            products={products}
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
          <InventoryManagerView
            products={products}
            onReload={loadData}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
            onDeleteProduct={handleDeleteProduct}
            userRoleName={user?.full_name || 'Admin'}
          />
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
