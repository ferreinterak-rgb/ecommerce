import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Minus, ArrowRight, Check } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (slug) {
        const found = await productService.getProductBySlug(slug);
        if (found) {
          setProduct(found);
          setSelectedImage(found.images[0] || '/dewalt-chopsaw.jpg');
          setSelectedSize(found.dimensions || 'Estándar 35MM');
          setSelectedMaterial(found.materials || 'Acero Inox 304');

          // Cargar productos relacionados
          const allProducts = await productService.getProducts();
          const related = allProducts
            .filter(p => p.id !== found.id && (p.category === found.category || true))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedMaterial, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Producto No Encontrado</h2>
        <p className="text-xs text-gray-500">El producto solicitado no existe o fue retirado del catálogo.</p>
        <Link to="/catalog" className="inline-block px-8 py-3.5 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const currentPrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);

  // Generar lista de thumbnails para la galería vertical (mínimo 3 vistas)
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : ['/dewalt-chopsaw.jpg'];
  const displayThumbnails = galleryImages.length >= 3
    ? galleryImages
    : [galleryImages[0], galleryImages[0], galleryImages[0]];

  // Opciones de material y tamaño
  const materialOptions = product.materials
    ? [product.materials, 'Acero Zincado', 'Acabado Negro'].slice(0, 3)
    : ['Acero Inox 304', 'Acero Zincado', 'Negro Mate'];

  const sizeOptions = product.dimensions
    ? [product.dimensions, '4X3 Pulgadas', 'Standard'].slice(0, 4)
    : ['35MM', '2 Pulgadas', '3 Pulgadas', '4X3'];

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* Breadcrumb estilo minimalista idéntico a la imagen de referencia */}
        <nav className="text-xs text-gray-400 flex items-center gap-2">
          <Link to="/" className="hover:text-black transition-colors">Home Page</Link>
          <span>&gt;</span>
          <Link to="/catalog" className="hover:text-black transition-colors">Catalog</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">{product.name}</span>
        </nav>

        {/* Bloque Principal del Producto (Galería Vertical a la izquierda + Detalles a la derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Columna Izquierda: Galería con miniaturas verticales y foto principal */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Lista Vertical de Miniaturas (3 recuadros suaves a la izquierda) */}
            <div className="flex sm:flex-col gap-3 justify-center sm:justify-start">
              {displayThumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-[#f4f4f4] p-2 flex items-center justify-center overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-black'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Gran Imagen Principal en marco redondeado neutro (#f4f4f4) */}
            <div className="flex-1 bg-[#f4f4f4] rounded-3xl aspect-square sm:aspect-[4/5] p-8 flex items-center justify-center relative overflow-hidden">
              <img
                src={selectedImage || product.images[0] || '/dewalt-chopsaw.jpg'}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-black text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  Oferta
                </span>
              )}
            </div>

          </div>

          {/* Columna Derecha: Información, selectores y botón de compra */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Título y Precio */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through font-mono">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {product.wholesale_price && (
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Precio mayorista disponible: <strong className="font-mono">{formatPrice(product.wholesale_price)}</strong>
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Description:
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {product.description || 'Diseñado con estándares de alta durabilidad y rendimiento profesional para carpintería, cerrajería y proyectos industriales.'}
              </p>
            </div>

            {/* Selector de Color / Material */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Color / Acabado:
              </h3>
              <div className="flex flex-wrap gap-2">
                {materialOptions.map((mat) => {
                  const isSelected = selectedMaterial === mat;
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-white text-black font-semibold'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-black' : 'bg-gray-300'}`} />
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Medida / Tamaño (Size) */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Size / Medida:
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-white text-black font-bold'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'border border-gray-400'}`} />
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fila de Controles: Selector de Cantidad + Botón Negro "Add To Cart" */}
            <div className="flex items-center gap-3 pt-3">
              
              {/* Selector de Cantidad en forma de píldora gris (#f4f4f4) */}
              <div className="bg-[#f4f4f4] rounded-full px-4 py-2.5 flex items-center gap-4 text-xs font-bold text-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="hover:text-black transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="hover:text-black transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botón de Compra 100% NEGRO estilo drop.code */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-sm"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <span>Add To Cart</span>
                    <span className="bg-neutral-800 text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium ml-1">
                      {formatPrice(currentPrice * quantity)}
                    </span>
                    <span className="text-white text-xs">&gt;</span>
                  </>
                )}
              </button>

            </div>

            {/* Especificaciones técnicas limpias */}
            <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
              <p>SKU: <strong className="font-mono text-slate-700">{product.sku}</strong></p>
              <p>Garantía: <strong className="text-slate-700">{product.warranty || '1 año directo de fábrica'}</strong></p>
              <p>Disponibilidad: <strong className="text-emerald-700">En stock ({product.stock} unidades)</strong></p>
            </div>

          </div>

        </div>

        {/* Sección de Productos Relacionados ("Related Product") idéntica a la imagen */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-gray-100 space-y-6">
            
            {/* Cabecera de la sección */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Related Product
              </h2>
              <Link to="/catalog" className="text-xs font-semibold text-slate-900 hover:text-gray-500 flex items-center gap-1">
                All Product <span>&gt;</span>
              </Link>
            </div>

            {/* Grid de 4 productos planos idénticos a la fila inferior de la imagen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="group space-y-2">
                  
                  {/* Recuadro de imagen plano con botón '+' en esquina superior derecha */}
                  <Link
                    to={`/product/${rel.slug}`}
                    className="block bg-[#f4f4f4] rounded-2xl aspect-[4/5] p-5 relative overflow-hidden group-hover:bg-[#ebe9e3] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(rel, 1);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
                      title="Añadir rápido"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <img
                      src={rel.images[0] || '/dewalt-chopsaw.jpg'}
                      alt={rel.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Textos y precio debajo de la imagen */}
                  <div>
                    <Link to={`/product/${rel.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:underline">
                        {rel.name}
                      </h4>
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                      <span>{rel.brand || 'FERREINTER'}</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatPrice(rel.discount_price ?? rel.price)}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
