import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';

import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { SmartWhatsAppButton } from './components/SmartWhatsAppButton';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { productService } from './services/productService';

// Layout wrapper to hide Navbar/Footer on login page or admin view if needed
const LayoutContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Inicializar sincronización en tiempo real (Supabase Realtime + Multi-pestaña)
  React.useEffect(() => {
    const cleanup = productService.initRealtimeSubscription();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Scroll to top of the page on route/navigation changes
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5] text-slate-900 font-sans antialiased selection:bg-[#ff5500] selection:text-white">
      {!isLoginPage && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {!isLoginPage && <Footer />}

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Botón Flotante Inteligente de WhatsApp */}
      {!isLoginPage && !isAdminPage && <SmartWhatsAppButton />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <CurrencyProvider>
          <Router>
            <LayoutContent />
          </Router>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
