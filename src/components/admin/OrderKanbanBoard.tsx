import React from 'react';
import { Order, OrderStatus } from '../../types';
import { Clock, RefreshCw, Truck, CheckCircle2, XCircle, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface KanbanProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onSelectOrder: (order: Order) => void;
}

const KANBAN_COLUMNS: { id: OrderStatus; label: string; icon: React.ElementType; color: string; badge: string }[] = [
  { id: 'pending', label: 'Pendiente', icon: Clock, color: 'border-amber-400 bg-amber-50/50', badge: 'bg-amber-100 text-amber-800' },
  { id: 'processing', label: 'Procesando', icon: RefreshCw, color: 'border-blue-400 bg-blue-50/50', badge: 'bg-blue-100 text-blue-800' },
  { id: 'shipped', label: 'Enviado', icon: Truck, color: 'border-purple-400 bg-purple-50/50', badge: 'bg-purple-100 text-purple-800' },
  { id: 'delivered', label: 'Entregado', icon: CheckCircle2, color: 'border-emerald-400 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'border-rose-400 bg-rose-50/50', badge: 'bg-rose-100 text-rose-800' }
];

export const OrderKanbanBoard: React.FC<KanbanProps> = ({
  orders,
  onUpdateStatus,
  onSelectOrder
}) => {
  const { formatPrice } = useCurrency();

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'pending') return 'processing';
    if (current === 'processing') return 'shipped';
    if (current === 'shipped') return 'delivered';
    return null;
  };

  const getPrevStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'processing') return 'pending';
    if (current === 'shipped') return 'processing';
    if (current === 'delivered') return 'shipped';
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tablero Kanban de Pedidos</h2>
          <p className="text-xs text-gray-500 mt-1">Gestiona el flujo de trabajo y cambia estados con un clic.</p>
        </div>
        <span className="text-xs font-mono font-bold bg-[#031834] text-[#f48f25] px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {orders.length} Pedidos Registrados
        </span>
      </div>

      {/* Kanban Columns Overflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter(o => o.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/60">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-700" />
                  <h3 className="font-extrabold text-xs text-slate-900">{col.label}</h3>
                </div>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colOrders.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center text-xs text-gray-400 font-medium italic border border-dashed border-gray-300 rounded-xl">
                    Sin pedidos en esta fase
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const prev = getPrevStatus(order.status);
                    const next = getNextStatus(order.status);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow space-y-2.5"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-extrabold text-xs text-[#031834]">
                            {order.order_number}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-slate-800 truncate">{order.customer_name}</p>
                          <p className="text-[10px] text-gray-500">{order.items.length} ítem(s) • {order.payment_method.toUpperCase()}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="font-black text-sm text-[#f48f25]">
                            {formatPrice(order.total)}
                          </span>

                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#031834] hover:text-white transition-colors text-slate-700"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="flex justify-between items-center gap-1 pt-1">
                          {prev ? (
                            <button
                              onClick={() => onUpdateStatus(order.id, prev)}
                              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-slate-700 flex items-center gap-0.5"
                            >
                              <ArrowLeft className="w-3 h-3" /> Mover atras
                            </button>
                          ) : <div />}

                          {next && (
                            <button
                              onClick={() => onUpdateStatus(order.id, next)}
                              className="px-2 py-1 rounded bg-[#031834] text-white hover:bg-[#f48f25] hover:text-black text-[10px] font-bold flex items-center gap-0.5 ml-auto"
                            >
                              Avanzar <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
