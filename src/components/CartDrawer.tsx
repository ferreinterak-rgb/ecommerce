import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    taxAmount,
    shippingCost,
    total
  } = useCart();
  const { formatPrice } = useCurrency();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    setCouponFeedback(res);
    if (res.success) setCouponCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl flex flex-col border-l border-gray-200">

          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#f48f25]" />
              <h2 className="text-lg font-black text-slate-900">Tu Carrito de Compras</h2>
              <span className="bg-[#f48f25] text-black text-xs font-black px-2.5 py-0.5 rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-slate-900 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4 stroke-1" />
                <p className="text-base font-bold text-slate-800">Tu carrito está vacío</p>
                <p className="text-xs mt-1 text-gray-500">Explora nuestro catálogo e incluye herramientas y materiales para tu obra.</p>
                <button
                  onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}
                  className="mt-6 px-6 py-3 rounded-full bg-[#111111] text-white font-extrabold text-xs hover:bg-[#f48f25] hover:text-black transition-all shadow-md"
                >
                  Explorar Productos
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discount_price ?? item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:border-[#f48f25]/50 transition-colors"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-xl bg-white p-2 border border-gray-200 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 pr-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[10px] text-[#f48f25] font-mono font-bold">{item.product.sku}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Buttons */}
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full p-1 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:text-[#f48f25]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:text-[#f48f25]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-black text-sm text-[#111111]">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon & Summary Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-gray-50/90 space-y-4">

              {/* Coupon input form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Cupon <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discount_percentage}%)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs underline hover:text-emerald-900">Quitar</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón (ej: FERRE20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white text-slate-900 placeholder-gray-400 text-xs rounded-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#f48f25]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#111111] text-white hover:bg-[#f48f25] hover:text-black font-extrabold text-xs rounded-full transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              )}
              {couponFeedback && !appliedCoupon && (
                <p className={`text-[11px] font-bold ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Total Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">{formatPrice(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>Impuesto estimado (IVA 19%):</span><span className="font-bold">{formatPrice(taxAmount)}</span></div>
                <div className="flex justify-between"><span>Envío:</span><span>{shippingCost === 0 ? <strong className="text-emerald-600">¡GRATIS!</strong> : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-gray-200">
                  <span>Total estimado:</span>
                  <span className="text-[#f48f25] text-xl font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-4 rounded-full bg-[#f48f25] text-black font-black text-sm hover:bg-[#e07d10] transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Proceder al Pago <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pago 100% Seguro con Garantía FERREINTER</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
