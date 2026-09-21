import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ShoppingCart, CheckCircle2, ShieldCheck, Truck, ArrowLeft, Plus, Minus, Wrench } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (slug) {
        const found = await productService.getProductBySlug(slug);
        if (found) {
          setProduct(found);
          setSelectedImage(found.images[0] || '');
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Producto No Encontrado</h2>
        <p className="text-xs text-gray-500">El producto solicitado no existe o fue retirado del catálogo.</p>
        <Link to="/catalog" className="inline-block px-6 py-3 rounded-xl bg-[#f48f25] text-black font-extrabold text-xs">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const currentPrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-white min-h-screen">
      
      {/* Breadcrumb back */}
      <div>
        <Link to="/catalog" className="text-xs font-bold text-gray-500 hover:text-[#f48f25] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
        </Link>
      </div>

      {/* Main Grid Detail */}
      <div className="bg-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#f8f7f5] rounded-2xl aspect-[1900/2375] p-8 flex items-center justify-center border border-gray-100 relative overflow-hidden">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#f48f25] text-black font-black text-xs px-3 py-1 rounded-full shadow">
                OFERTA ESPECIAL
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-xl bg-[#f8f7f5] border p-2 overflow-hidden ${
                    selectedImage === img ? 'border-[#f48f25] ring-2 ring-[#f48f25]/30' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column Product Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase mb-2">
              <span className="text-[#f48f25] tracking-widest">{product.brand}</span>
              <span className="font-mono text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviews_count} opiniones de compradores)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#031834]">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-gray-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Stock disponible ({product.stock} unidades)
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase">Seleccionar Configuración / Tamaño:</label>
            <div className="flex gap-2">
              {['Standard', 'Kit Profesional + Estuche'].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedVariant === v
                      ? 'bg-[#031834] text-[#f48f25] border-[#f48f25]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1.5 border border-gray-200 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:text-[#f48f25]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-sm px-2">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 hover:text-[#f48f25]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity, undefined, selectedVariant)}
              className="flex-1 py-4 rounded-xl bg-[#f48f25] text-black font-extrabold text-sm hover:bg-[#d97706] transition-all shadow-xl shadow-[#f48f25]/30 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" /> Añadir al Carrito
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-gray-600 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#f48f25]" />
              <span>Despacho express a nivel nacional</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#f48f25]" />
              <span>Garantía de 1 a 3 años según fabricante</span>
            </div>
          </div>

        </div>
      </div>

      {/* Technical Specs Table */}
      {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#f48f25]" /> Especificaciones Técnicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.technical_specs).map(([key, val]) => (
              <div key={key} className="flex justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <span className="font-bold text-gray-500">{key}</span>
                <span className="font-semibold text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
