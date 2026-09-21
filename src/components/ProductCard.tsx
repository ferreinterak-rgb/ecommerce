import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
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

  // Use the studio isolated chop saw image from image 3 (1900 x 2375 ratio) or first image
  const productImage = product.images[0] || '/dewalt-chopsaw.jpg';

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group font-sans">
      
      {/* Top Image Container: Neutral Studio Frame with 1900 x 2375 Aspect Ratio */}
      <Link
        to={`/product/${product.slug}`}
        className="relative bg-[#f8f7f5] rounded-2xl aspect-[1900/2375] p-5 flex flex-col items-center justify-center overflow-hidden mb-4 border border-transparent group-hover:border-[#f48f25]/30 transition-all duration-300"
      >
        {/* Top Left Discount Tag */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#f48f25] text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase font-mono shadow-sm z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Studio Product Image */}
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* 4 Pagination Slider Dots at the bottom center matching image 2 */}
        <div className="flex items-center justify-center gap-1.5 absolute bottom-3 left-0 right-0 z-10">
          <span className="w-2 h-2 rounded-full bg-slate-900 shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
      </Link>

      {/* Card Content (Title, Tagline, Description) */}
      <div className="space-y-1 px-1">
        
        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block group-hover:text-[#f48f25] transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Tagline */}
        <p className="text-xs text-gray-400 font-medium line-clamp-1">
          {product.brand ? `Línea Profesional ${product.brand}` : 'Herramienta de Máximo Rendimiento'}
        </p>

        {/* Short Description */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-1">
          {product.description || 'Diseñado con materiales de alta resistencia para garantizar la máxima durabilidad en el trabajo.'}
        </p>

      </div>

      {/* Bottom Row: Colombian Price + Black Pill CTA Button with White Circle Arrow */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-gray-100 px-1">
        
        {/* Price in COP (Single line formatted cleanly) */}
        <div className="flex flex-col shrink-0">
          <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight whitespace-nowrap">
            {formatPrice(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through font-mono whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Pill CTA Button matching reference image 2: "Comprar ↗" */}
        <button
          onClick={() => addToCart(product, 1)}
          className="bg-[#111111] hover:bg-[#f48f25] text-white hover:text-black font-bold text-xs sm:text-sm pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm transition-all transform active:scale-95 group/btn shrink-0 whitespace-nowrap"
          title="Añadir al carrito"
        >
          <span>Comprar</span>
          <span className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </button>

      </div>

    </div>
  );
};
