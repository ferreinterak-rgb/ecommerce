import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { activityLogService } from '../services/activityLogService';
import { PaymentMethod, ShippingAddress } from '../types';
import { ShieldCheck, Lock, CreditCard, Landmark, Truck, CheckCircle2, ArrowRight, Tag } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discountAmount,
    taxAmount,
    shippingCost,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();
  const { formatPrice } = useCurrency();

  const [customerName, setCustomerName] = useState('Carlos Mendoza');
  const [customerEmail, setCustomerEmail] = useState('carlos.mendoza@constructora.com');
  const [customerPhone, setCustomerPhone] = useState('+57 310 456 7890');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Carlos Mendoza',
    address: 'Av. Industrial # 45-20, Edificio Co-Working',
    city: 'Bogotá',
    state: 'Cundinamarca',
    zipCode: '110911',
    phone: '+57 310 456 7890',
    notes: 'Entregar en portería principal con previa llamada'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  if (cart.length === 0 && !completedOrderNumber) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Tu carrito está vacío</h2>
        <p className="text-xs text-gray-500">Agrega productos del catálogo para proceder con la compra.</p>
        <Link to="/catalog" className="inline-block px-6 py-3 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = await applyCoupon(couponCodeInput);
    setCouponMessage(res.message);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const orderItems = cart.map(item => ({
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        price: item.product.discount_price ?? item.product.price,
        quantity: item.quantity,
        subtotal: (item.product.discount_price ?? item.product.price) * item.quantity
      }));

      const created = await orderService.createOrder({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        status: 'pending',
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        shipping_cost: shippingCost,
        total,
        items: orderItems,
        notes: shippingAddress.notes
      });

      await activityLogService.logAction(
        'Nuevo Pedido Creado',
        'Pedido',
        created.order_number,
        `Monto total: ${formatPrice(created.total)} USD via ${paymentMethod}`,
        customerName
      );

      setCompletedOrderNumber(created.order_number);
      clearCart();
    } catch (err) {
      console.error('Error placing order', err);
    } finally {
      setProcessing(false);
    }
  };

  if (completedOrderNumber) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-black text-slate-900">¡Pedido Confirmado con Éxito!</h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Gracias por confiar en <strong>FERRE INTER</strong>. Hemos enviado la confirmación y recibo de compra al correo electrónico <strong>{customerEmail}</strong>.
        </p>

        <div className="p-6 rounded-2xl bg-[#031834] text-white space-y-2 max-w-md mx-auto border border-[#f48f25]/30">
          <span className="text-xs text-gray-400 font-mono">NÚMERO DE ORDEN</span>
          <div className="text-2xl font-mono font-black text-[#f48f25]">{completedOrderNumber}</div>
          <p className="text-[11px] text-gray-300 pt-2 border-t border-white/10">
            Puedes realizar el seguimiento del pedido con tu número de orden en cualquier momento.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link to="/catalog" className="px-6 py-3 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs">
            Seguir Comprando
          </Link>
          <Link to="/admin" className="px-6 py-3 rounded-xl bg-[#031834] text-white font-bold text-xs">
            Ver en Panel Kanban (Admin)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finalizar Compra</h1>
        <p className="text-xs text-gray-500 mt-1">Completa los datos de envío y pago seguro para procesar tu orden.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Shipping & Customer Info */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-gray-100 pb-3">
              1. Datos del Comprador
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo / Razón Social *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Teléfono de Contacto *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-gray-100 pb-3">
              2. Dirección de Envío y Despacho
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Dirección Exacta (Calle/Carrera, Edificio, Obra) *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departamento / Provincia *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Notas de Entrega u Horario Especial</label>
                <textarea
                  rows={2}
                  value={shippingAddress.notes || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                  placeholder="Ej. Entregar en la obra de la Calle 80..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-gray-100 pb-3">
              3. Método de Pago
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { id: 'credit_card', label: 'Tarjeta de Crédito / Débito (Visa, Mastercard, Amex)', icon: CreditCard },
                { id: 'pse', label: 'PSE / Transferencia Débito Bancario Directo', icon: Landmark },
                { id: 'bank_transfer', label: 'Transferencia Bancaria a Cuenta Empresarial FERRE INTER', icon: Landmark },
                { id: 'cash_on_delivery', label: 'Pago Contra Entrega (Efectivo al recibir)', icon: Truck }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#f48f25] bg-[#f48f25]/5 text-slate-900 font-bold ring-1 ring-[#f48f25]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                      className="w-4 h-4 text-[#f48f25] accent-[#f48f25]"
                    />
                    <Icon className="w-5 h-5 text-[#f48f25]" />
                    <span className="flex-1">{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#031834] text-white p-6 rounded-3xl border border-white/10 shadow-xl space-y-6 sticky top-28">
            
            <h3 className="font-bold text-base text-white border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Resumen de la Orden</span>
              <span className="text-xs text-[#f48f25] font-mono">{cart.length} Artículos</span>
            </h3>

            {/* Cart items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemPrice = item.product.discount_price ?? item.product.price;
                return (
                  <div key={item.product.id} className="flex justify-between items-center text-xs">
                    <div className="truncate pr-2">
                      <p className="font-bold text-white truncate">{item.product.name}</p>
                      <span className="text-[10px] text-gray-400">Cant: {item.quantity} × {formatPrice(itemPrice)}</span>
                    </div>
                    <span className="font-bold text-[#f48f25] shrink-0">{formatPrice(itemPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code section */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {appliedCoupon ? (
                <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <span>Cupon <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discount_percentage}%)</span>
                  <button type="button" onClick={removeCoupon} className="underline text-[10px]">Quitar</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cupón (ej: FERRE20)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 bg-white/10 text-white placeholder-gray-400 text-xs rounded-xl px-3 py-2 border border-white/15 focus:outline-none focus:border-[#f48f25]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#f48f25] text-black font-bold text-xs rounded-xl hover:bg-[#d97706]"
                  >
                    Aplicar
                  </button>
                </div>
              )}
              {couponMessage && !appliedCoupon && <p className="text-[10px] text-rose-400">{couponMessage}</p>}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs text-gray-300 pt-4 border-t border-white/10">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatPrice(subtotal)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400"><span>Descuento:</span><span>-{formatPrice(discountAmount)}</span></div>
              )}
              <div className="flex justify-between"><span>IVA Estimado (19%):</span><span>{formatPrice(taxAmount)}</span></div>
              <div className="flex justify-between"><span>Costo de Despacho:</span><span>{shippingCost === 0 ? <strong className="text-emerald-400">¡GRATIS!</strong> : formatPrice(shippingCost)}</span></div>
              
              <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-white/15">
                <span>Total a Pagar:</span>
                <span className="text-[#f48f25] text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-xl bg-[#f48f25] text-black font-black text-sm hover:bg-[#d97706] transition-all shadow-xl shadow-[#f48f25]/30 flex items-center justify-center gap-2"
            >
              {processing ? 'Procesando Orden...' : 'Pagar y Confirmar Pedido'}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cifrado SSL 256-bit y Garantía de Satisfacción</span>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
