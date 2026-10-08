import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Package, Image as ImageIcon, UploadCloud, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { uploadProductImage } from '../../services/imageUploadService';

interface FormProps {
  productToEdit?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'bisagras', name: 'Bisagras Especializadas' },
  { id: 'chapas', name: 'Chapas & Cerraduras' },
  { id: 'discos-corte', name: 'Discos de Corte' },
  { id: 'prensas-fijacion', name: 'Prensas de Sujeción' },
  { id: 'brocas-accesorios', name: 'Brocas & Perforación' },
  { id: 'escuadras-medicion', name: 'Escuadras de Medición' },
  { id: 'placas-reparacion', name: 'Placas de Reparación' },
  { id: 'herrajes-carpinteria', name: 'Herrajes de Carpintería' },
];

export const ProductRegistrationForm: React.FC<FormProps> = ({
  productToEdit,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: 'FERREINTER',
    sku: '',
    category: 'bisagras',
    price: 0,
    discount_price: undefined,
    wholesale_price: undefined,
    stock: 1000,
    stock_warehouse: 400,
    stock_store: 200,
    stock_online: 400,
    warranty: '1 AÑO',
    dimensions: '',
    materials: '',
    inventory_status: 'Disponible',
    description: '',
    images: ['/dewalt-chopsaw.jpg'],
    is_featured: false,
    is_active: true
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageUrlInput(productToEdit.images[0]);
      }
    }
  }, [productToEdit]);

  // Maneja la subida de fotos desde el computador
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadFeedback(null);

    try {
      const file = files[0];
      const result = await uploadProductImage(file);
      
      const currentImages = (formData.images || []).filter(img => img !== '/dewalt-chopsaw.jpg');
      const updatedImages = [result.url, ...currentImages];

      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }));
      setImageUrlInput(result.url);
      setUploadFeedback('¡Foto cargada exitosamente!');
    } catch (err: any) {
      console.error('Error al subir foto:', err);
      setUploadFeedback('Error al procesar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = (formData.images || []).filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      images: updated.length > 0 ? updated : ['/dewalt-chopsaw.jpg']
    }));
    if (indexToRemove === 0) {
      setImageUrlInput(updated[0] || '');
    }
  };

  const handleStockChange = (field: 'stock_warehouse' | 'stock_store' | 'stock_online', val: number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      const total = (updated.stock_warehouse || 0) + (updated.stock_store || 0) + (updated.stock_online || 0);
      return { ...updated, stock: total };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const manualUrl = imageUrlInput.trim();
      let finalImages = [...(formData.images || [])];
      if (manualUrl && !finalImages.includes(manualUrl)) {
        finalImages = [manualUrl, ...finalImages];
      }

      await onSave({
        ...formData,
        images: finalImages
      });
      onClose();
    } catch (err) {
      console.error('Error guardando producto:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#031834] text-white flex items-center justify-between border-b border-[#f48f25]/30">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#f48f25]" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                {productToEdit ? 'Editar Producto del Inventario' : 'Registrar Nuevo Producto'}
              </h3>
              <p className="text-[10px] text-gray-300">
                Catálogo FERREINTER — Gestión comercial & técnica
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* 1. SECCIÓN DE FOTOS DEL PRODUCTO */}
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#f48f25]" />
                Fotografía del Producto
              </label>
              {uploadFeedback && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {uploadFeedback}
                </span>
              )}
            </div>

            {/* Vista previa de imágenes actuales */}
            <div className="flex flex-wrap gap-3 items-center">
              {(formData.images || []).map((imgUrl, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
                  <img src={imgUrl} alt={`Foto ${idx}`} className="w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#031834]/90 text-[9px] font-bold text-white text-center py-0.5">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* Botón para subir archivo desde computador */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-[#f48f25] hover:bg-[#f48f25]/10 flex flex-col items-center justify-center gap-1 text-[#f48f25] font-bold transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-[9px]">{uploadingImage ? 'Subiendo...' : 'Subir Foto'}</span>
                </button>
              </div>
            </div>

            {/* URL alternativa */}
            <div className="pt-2 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="O escribe una URL de imagen: https://..."
                className="flex-1 rounded-lg border border-gray-300 p-2 text-xs focus:border-[#f48f25] focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* 2. IDENTIFICACIÓN Y CATEGORÍA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Bisagra Parche Inoxidable 304"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marca *</label>
              <input
                type="text"
                required
                value={formData.brand || 'FERREINTER'}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ej. LOCK PRIME, FORZA, GATO"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ej. KD4"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría *</label>
              <select
                value={formData.category || 'bisagras'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none bg-white font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado de Inventario</label>
              <select
                value={formData.inventory_status || 'Disponible'}
                onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none bg-white font-medium"
              >
                <option value="Disponible">Disponible</option>
                <option value="Privado">Privado</option>
                <option value="Agotado">Agotado</option>
                <option value="Bajo Pedido">Bajo Pedido</option>
              </select>
            </div>
          </div>

          {/* 3. PRECIOS (COP) */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-[#b45309]">
              Precios Comerciales (Pesos Colombianos - COP)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Precio Venta (COP) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Ej. 7800"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Precio Por Mayor (COP)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.wholesale_price || ''}
                  onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Ej. 6700"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none text-emerald-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Precio Oferta (COP)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.discount_price || ''}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Ej. 7500 (Opcional)"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. STOCK DESGLOSADO */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-blue-900">
                Distribución de Stock
              </h4>
              <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                Total: {formData.stock || 0} unidades
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Bodega</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_warehouse ?? 400}
                  onChange={(e) => handleStockChange('stock_warehouse', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Tienda</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_store ?? 200}
                  onChange={(e) => handleStockChange('stock_store', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#f48f25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Web</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_online ?? 400}
                  onChange={(e) => handleStockChange('stock_online', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#f48f25] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. ESPECIFICACIONES TÉCNICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Garantía</label>
              <input
                type="text"
                value={formData.warranty || ''}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                placeholder="Ej. 10 AÑOS, 1 AÑO"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dimensiones</label>
              <input
                type="text"
                value={formData.dimensions || ''}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="Ej. 35MM, 4X3, 10 Pulgadas"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Materiales</label>
              <input
                type="text"
                value={formData.materials || ''}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="Ej. ACERO INOX 304, ZINCADO"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción Comercial & Técnica *</label>
            <textarea
              rows={3}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Escribe la descripción de la aplicación y características..."
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-[#f48f25] accent-[#f48f25] rounded"
              />
              <span className="font-bold text-slate-700">Producto Destacado</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active !== undefined ? formData.is_active : true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#f48f25] accent-[#f48f25] rounded"
              />
              <span className="font-bold text-slate-700">Producto Activo / Visible</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-[#f48f25] text-black font-extrabold hover:bg-[#d97706] flex items-center gap-2 shadow-md shadow-[#f48f25]/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
