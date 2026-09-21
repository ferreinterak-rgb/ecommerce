import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { couponService } from '../services/couponService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, variant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ferre_inter_cart_v1';
const COUPON_STORAGE_KEY = 'ferre_inter_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist coupon', e);
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity = 1, color?: string, variant?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99)
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedColor: color, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const coupon = await couponService.validateCoupon(code);
    if (coupon) {
      setAppliedCoupon(coupon);
      return { success: true, message: `¡Cupon ${coupon.code} aplicado! (-${coupon.discount_percentage}%)` };
    }
    return { success: false, message: 'Cupón inválido o expirado. Prueba con FERRE20' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.discount_price ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount_percentage) / 100 : 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableBase * 0.19; // 19% IVA standard
  const shippingCost = subtotal > 150 || cart.length === 0 ? 0 : 15.00;
  const total = taxableBase + taxAmount + shippingCost;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        taxAmount,
        shippingCost,
        total,
        totalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
