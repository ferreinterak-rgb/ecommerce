import React from 'react';
import { X, ShoppingBag, MapPin, Phone, Mail, CreditCard, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface ModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const OrderDetailModal: React.FC<ModalProps> = ({
  order,
  onClose,
  onUpdateStatus
}) => {
  const { formatPrice } = useCurrency();

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#031834] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#f48f25]" />
            <div>
              <h3 className="font-extrabold text-base">Pedido #{order.order_number}</h3>
              <p className="text-[10px] text-gray-400">Fecha: {new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-800">
          
          {/* Status selector bar */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Estado Actual:</span>
              <div className="font-black text-sm text-[#031834] uppercase">{order.status}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Cambiar Estado:</span>
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-bold focus:border-[#f48f25] focus:outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-gray-100 pb-1 text-sm">Datos del Cliente</h4>
              <p className="font-bold">{order.customer_name}</p>
              <p className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5 text-[#f48f25]" /> {order.customer_email}</p>
              <p className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3.5 h-3.5 text-[#f48f25]" /> {order.customer_phone}</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-gray-100 pb-1 text-sm">Dirección de Envío</h4>
              <p className="flex items-start gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#f48f25] shrink-0 mt-0.5" />
                <span>{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state}</span>
              </p>
              <p className="flex items-center gap-1.5 text-gray-600">
                <CreditCard className="w-3.5 h-3.5 text-[#f48f25]" /> Pago: <span className="uppercase font-bold">{order.payment_method}</span>
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Artículos del Pedido</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-center">Cantidad</th>
                    <th className="p-3 text-right">Precio</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-slate-900">{item.product_name}</td>
                      <td className="p-3 font-mono text-gray-400">{item.product_sku}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">{formatPrice(item.price)}</td>
                      <td className="p-3 text-right font-bold text-[#f48f25]">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-emerald-600"><span>Descuento:</span><span>-{formatPrice(order.discount)}</span></div>
              <div className="flex justify-between"><span>Impuestos (IVA 19%):</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex justify-between"><span>Envío:</span><span>{formatPrice(order.shipping_cost)}</span></div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-gray-200">
                <span>Total del Pedido:</span>
                <span className="text-[#f48f25]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
