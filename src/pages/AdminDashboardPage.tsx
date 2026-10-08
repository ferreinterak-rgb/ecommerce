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
