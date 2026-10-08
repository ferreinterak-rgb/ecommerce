import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const currentPrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const productImage = product.images[0] || '/dewalt-chopsaw.jpg';

  return (
    <div className="group flex flex-col justify-between font-sans transition-all duration-200">
      
      {/* Top Image Container: Imagen completamente limpia sin marco ni fondo gris */}
      <Link
        to={`/product/${product.slug}`}
        className="relative bg-white aspect-square p-2 flex items-center justify-center overflow-hidden mb-3"
      >
        {/* Badge de Oferta / Descuento */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-black text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase font-mono shadow-sm z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Imagen limpia del producto */}
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Product Content (Tipografía limpia sin envolturas de tarjeta) */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Metadata: Marca y Dimensiones */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">
              {product.brand || 'FERREINTER'}
            </span>
            {product.dimensions && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-mono text-[10px] bg-gray-200/60 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                  {product.dimensions}
                </span>
              </>
            )}
          </div>

          {/* Título del Producto */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-[#f48f25] transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Fila de Precios y Botón de Compra */}
        <div className="flex items-end justify-between gap-2 pt-2 mt-1">
          
          {/* Precios en COP */}
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight whitespace-nowrap">
              {formatPrice(currentPrice)}
            </span>
            {product.wholesale_price ? (
              <span className="text-[11px] text-emerald-700 font-bold font-mono whitespace-nowrap">
                Mayor: {formatPrice(product.wholesale_price)}
              </span>
            ) : hasDiscount ? (
              <span className="text-[11px] text-gray-400 line-through font-mono whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          {/* Botón Comprar moderno y estilizado */}
          <button
            onClick={() => addToCart(product, 1)}
            className="bg-slate-950 hover:bg-[#f48f25] text-white hover:text-black font-bold text-xs sm:text-sm pl-3.5 pr-1.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all transform active:scale-95 group/btn shrink-0"
            title="Añadir al carrito"
          >
            <span>Comprar</span>
            <span className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
