import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, MapPin, Truck, HelpCircle, ArrowRight } from 'lucide-react';
import { FerreInterLogo } from './FerreInterLogo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      
      {/* 1. Top Utility Strip (Dark Black) */}
      <div className="bg-[#111111] text-gray-300 text-[11px] font-medium py-2 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <span className="w-2 h-2 rounded-full bg-[#f48f25] animate-pulse shrink-0" />
            <span className="truncate text-center sm:text-left">Envío gratis por compras mayores a $500.000</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-gray-300 text-[11px] shrink-0">
            <Link to="/booking" className="hover:text-[#f48f25] transition-colors">Ubicación de Tiendas</Link>
            <span className="text-gray-700">|</span>
            <Link to="/admin" className="hover:text-[#f48f25] transition-colors">Rastrear Pedido</Link>
            <span className="text-gray-700">|</span>
            <Link to="/booking" className="hover:text-[#f48f25] transition-colors">Ayuda & Soporte</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Trigger + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-800 hover:text-[#f48f25] focus:outline-none rounded-lg hover:bg-gray-100"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <Link to="/" className="flex items-center">
              <FerreInterLogo size="md" />
            </Link>
          </div>

          {/* Center Navigation Links (Pill-inspired active styling) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-800 tracking-wide uppercase">
            <Link to="/" className="hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              INICIO
            </Link>
            <Link to="/catalog" className="flex items-center gap-1 hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              TIENDA <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/catalog" className="flex items-center gap-1 hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              CATEGORÍAS <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/booking" className="hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              NOSOTROS
            </Link>
            <Link to="/catalog" className="hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              BLOG
            </Link>
            <Link to="/booking" className="hover:text-[#f48f25] transition-colors py-1 px-3 rounded-full hover:bg-gray-100">
              CONTACTO
            </Link>
          </nav>

          {/* Right: Modern Embedded Search Pill + User + Cart Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
            
            {/* Embedded Search Pill Bar matching UI Kit (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center bg-[#f4f5f7] border border-gray-200 focus-within:border-[#f48f25] rounded-full pl-4 pr-1 py-1 transition-all shadow-inner w-56 md:w-64 lg:w-72">
              <input
                type="text"
                placeholder="Buscar herramientas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder-gray-400 font-medium"
              />
              <button
                type="submit"
                className="bg-[#f48f25] hover:bg-[#e07d18] text-black font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 shrink-0 flex items-center gap-1"
              >
                <Search className="w-3 h-3 stroke-[3]" />
                <span>BUSCAR</span>
              </button>
            </form>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="sm:hidden text-slate-800 hover:text-[#f48f25] transition-colors p-1.5 rounded-full hover:bg-gray-100"
              title="Buscar productos"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="text-slate-800 hover:text-[#f48f25] transition-colors p-1.5 rounded-full hover:bg-gray-100 flex items-center justify-center"
                title="Cuenta de usuario"
              >
                <User className="w-5 h-5 stroke-[2]" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-xs font-medium">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 font-bold text-slate-900 truncate">
                        {user.full_name || user.email}
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2.5 hover:bg-gray-50 text-slate-800"
                      >
                        Panel Administrativo
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-red-600 font-bold"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2.5 hover:bg-gray-50 text-[#f48f25] font-bold"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/login?tab=register"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                      >
                        Crear Cuenta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Drawer Trigger Button */}
            <div className="relative flex items-center justify-center mr-1 sm:mr-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#111111] hover:bg-[#f48f25] text-white hover:text-black p-2 sm:p-2.5 rounded-full transition-all relative flex items-center justify-center shadow-md active:scale-95 group shrink-0"
                title="Ver Carrito"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#f48f25] text-black font-black text-[10px] sm:text-[11px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md leading-none">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Search Drawer */}
      {showSearchModal && (
        <div className="bg-white border-b border-gray-200 p-3 shadow-md sm:hidden animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#f4f5f7] rounded-full p-1 border border-gray-200">
            <input
              type="text"
              placeholder="Buscar por taladro, disco, flexómetro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent border-none focus:outline-none px-4 text-slate-900"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#f48f25] text-black font-bold text-xs px-4 py-2 rounded-full shadow-sm"
            >
              BUSCAR
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-5 py-6 space-y-6 text-sm font-bold text-slate-900 animate-in slide-in-from-top duration-200 shadow-xl">
          
          {/* Quick Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#f4f5f7] rounded-full p-1 border border-gray-200">
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent border-none focus:outline-none px-3 text-slate-900 font-medium"
            />
            <button
              type="submit"
              className="bg-[#f48f25] text-black font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-sm"
            >
              BUSCAR
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>INICIO</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>TIENDA</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>CATEGORÍAS</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>NOSOTROS</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>BLOG</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-slate-900 font-black tracking-wider text-xs uppercase"
            >
              <span>CONTACTO</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </nav>

          {/* Mobile Utility Footer Links */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wider block">Servicios & Ayuda</span>
            <div className="space-y-2 text-xs font-semibold text-gray-600">
              <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-[#f48f25]">
                <MapPin className="w-4 h-4 text-[#f48f25]" />
                <span>Ubicación de Tiendas</span>
              </Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-[#f48f25]">
                <Truck className="w-4 h-4 text-[#f48f25]" />
                <span>Rastrear Pedido</span>
              </Link>
              <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-[#f48f25]">
                <HelpCircle className="w-4 h-4 text-[#f48f25]" />
                <span>Ayuda & Soporte</span>
              </Link>
            </div>
          </div>

        </div>
      )}

    </header>
  );
};
