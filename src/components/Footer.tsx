import React from 'react';
import { Link } from 'react-router-dom';
import { FerreInterLogo } from './FerreInterLogo';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111111] text-gray-400 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <FerreInterLogo size="md" />
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              FERREINTER es tu ferretería de confianza con herramientas eléctricas, manuales, suministros de construcción y plomería de la más alta calidad.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#f48f25]" /> Av. Industrial #450, Zona Comercial
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-[#f48f25]" /> +1 (800) 555-FERRE
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#f48f25]" /> contacto@ferreinter.com
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Enlaces Rápido</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#f48f25] transition-colors">Inicio</Link></li>
              <li><Link to="/catalog" className="hover:text-[#f48f25] transition-colors">Tienda</Link></li>
              <li><Link to="/catalog" className="hover:text-[#f48f25] transition-colors">Categorías</Link></li>
              <li><Link to="/booking" className="hover:text-[#f48f25] transition-colors">Nosotros</Link></li>
              <li><Link to="/booking" className="hover:text-[#f48f25] transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Atención al Cliente</h4>
            <ul className="space-y-2">
              <li><Link to="/admin" className="hover:text-[#f48f25] transition-colors">Rastrear Pedido</Link></li>
              <li><Link to="/booking" className="hover:text-[#f48f25] transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/booking" className="hover:text-[#f48f25] transition-colors">Soporte Técnico</Link></li>
              <li><Link to="/booking" className="hover:text-[#f48f25] transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/login" className="hover:text-[#f48f25] transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Boletín Informativo</h4>
            <p className="text-xs text-gray-400">
              Suscríbete para recibir ofertas exclusivas y novedades de ferretería en tu correo.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("¡Gracias por suscribirte!"); }} className="space-y-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f48f25]"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#f48f25] hover:bg-[#e07d18] text-black font-bold text-xs py-2.5 rounded-md transition-colors"
              >
                Suscribirme
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} FERREINTER. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Términos de Servicio</a>
            <a href="#" className="hover:text-gray-300">Política de Privacidad</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
