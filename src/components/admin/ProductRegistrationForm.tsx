import React, { useState, useEffect } from 'react';
import { X, Save, Package, Image as ImageIcon, Check } from 'lucide-react';
import { Product } from '../../types';

interface FormProps {
  productToEdit?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

export const ProductRegistrationForm: React.FC<FormProps> = ({
  productToEdit,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: 'FERRE INTER',
    sku: '',
    category: 'herramientas-electricas',
    price: 0,
    discount_price: undefined,
    stock: 10,
    description: '',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800'],
    is_featured: false,
    is_active: true
  });

  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageUrlInput(productToEdit.images[0]);
      }
    }
  }, [productToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalImages = imageUrlInput.trim() ? [imageUrlInput.trim()] : formData.images;
      await onSave({
        ...formData,
        images: finalImages
      });
      onClose();
    } catch (err) {
      console.error('Error saving product', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#031834] text-white flex items-center justify-between border-b border-[#f48f25]/20">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#f48f25]" />
            <h3 className="font-bold text-base">
              {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Taladro Percutor 20V Max"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marca *</label>
              <input
                type="text"
                required
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ej. DeWalt, Stanley, Craftsman"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ej. DCD996B-20V"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría *</label>
              <select
                value={formData.category || 'herramientas-electricas'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none bg-white"
              >
                <option value="herramientas-electricas">Herramientas Eléctricas</option>
                <option value="herramientas-manuales">Herramientas Manuales</option>
                <option value="plomeria-y-fontaneria">Plomería y Fontanería</option>
                <option value="pintura-y-acabados">Pintura y Acabados</option>
                <option value="electricidad-e-iluminacion">Electricidad</option>
                <option value="construccion-y-seguridad">Seguridad & Ferretería</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Disponible *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock !== undefined ? formData.stock : 10}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Precio Normal (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="199.00"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Precio con Descuento (Opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_price || ''}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="179.99"
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL de Imagen del Producto</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 rounded-lg border border-gray-300 p-2.5 focus:border-[#f48f25] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción Técnica *</label>
            <textarea
              rows={3}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Escribe las especificaciones principales y garantía..."
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
              <span className="font-bold text-slate-700">Producto Destacado en Inicio</span>
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
              className="px-6 py-2 rounded-xl bg-[#f48f25] text-black font-extrabold hover:bg-[#d97706] flex items-center gap-2 shadow-md shadow-[#f48f25]/30"
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
