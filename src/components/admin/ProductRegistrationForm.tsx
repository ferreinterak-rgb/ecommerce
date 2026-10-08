import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Package, 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Star,
  ArrowLeft,
  ArrowRight,
  Plus,
  Eye,
  Layers,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  GripHorizontal
} from 'lucide-react';
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
    images: [],
    is_featured: false,
    is_active: true
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        images: productToEdit.images && productToEdit.images.length > 0 ? [...productToEdit.images] : []
      });
    }
  }, [productToEdit]);

  // Procesa la subida de una o varias imágenes a Supabase Storage
  const processFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setUploadingImages(true);
    setUploadFeedback(null);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Subiendo ${i + 1} de ${fileArray.length}: ${file.name}...`);
        
        // Sube a Supabase Storage (bucket 'products') con optimización
        const result = await uploadProductImage(file);
        if (result?.url) {
          uploadedUrls.push(result.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const current = (prev.images || []).filter(img => img !== '/dewalt-chopsaw.jpg');
          return {
            ...prev,
            images: [...current, ...uploadedUrls]
          };
        });

        setUploadFeedback({
          type: 'success',
          message: `¡${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'fotografía guardada' : 'fotografías guardadas'} en Storage con éxito!`
        });
      }
    } catch (err: any) {
      console.error('Error al subir fotografías a Supabase Storage:', err);
      setUploadFeedback({
        type: 'error',
        message: 'Ocurrió un inconveniente al subir alguna fotografía al Storage.'
      });
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFilesUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesUpload(e.dataTransfer.files);
    }
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeaveArea = () => {
    setIsDragOver(false);
  };

  // Agregar imagen por URL manual
  const handleAddManualUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormData(prev => {
      const current = (prev.images || []).filter(img => img !== '/dewalt-chopsaw.jpg');
      if (current.includes(trimmed)) return prev;
      return {
        ...prev,
        images: [...current, trimmed]
      };
    });
    setImageUrlInput('');
    setShowUrlInput(false);
    setUploadFeedback({
      type: 'success',
      message: 'Imagen por URL vinculada exitosamente.'
    });
  };

  // Establecer una foto como Principal (Mover a la posición 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const list = [...(prev.images || [])];
      const [selected] = list.splice(index, 1);
      list.unshift(selected);
      return { ...prev, images: list };
    });
  };

  // Mover una foto una posición hacia la izquierda o derecha
  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    setFormData(prev => {
      const list = [...(prev.images || [])];
      if (toIndex < 0 || toIndex >= list.length) return prev;
      const temp = list[fromIndex];
      list[fromIndex] = list[toIndex];
      list[toIndex] = temp;
      return { ...prev, images: list };
    });
  };

  // Drag & drop interno para reordenar fotos entre sí
  const handleItemDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemDrop = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      return;
    }
    setFormData(prev => {
      const list = [...(prev.images || [])];
      const [item] = list.splice(draggedIdx, 1);
      list.splice(targetIndex, 0, item);
      return { ...prev, images: list };
    });
    setDraggedIdx(null);
  };

  // Eliminar una foto
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
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
      const cleanImages = (formData.images || []).filter(img => img && img.trim().length > 0);
      
      await onSave({
        ...formData,
        images: cleanImages.length > 0 ? cleanImages : []
      });
      onClose();
    } catch (err) {
      console.error('Error guardando producto:', err);
    } finally {
      setSaving(false);
    }
  };

  const imagesList = formData.images || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Modal Container Extendido y Atractivo */}
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] transition-all">
        
        {/* Header Superior con branding FERREINTER */}
        <div className="px-6 py-4.5 bg-[#031834] text-white flex items-center justify-between border-b border-[#f48f25]/40 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
              <Package className="w-5 h-5 text-[#f48f25]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-wide text-white">
                  {productToEdit ? 'Editar Ficha de Producto' : 'Registro de Nuevo Producto'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f48f25]/20 text-[#f48f25] border border-[#f48f25]/30">
                  {productToEdit ? 'Modo Edición' : 'Creación'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gestión comercial, multimedia en Supabase Storage y control multisede
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario en 2 Columnas Maestras */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

            {/* ========================================================
                COLUMNA IZQUIERDA: GESTOR DE MULTIMEDIA Y FOTOGRAFÍAS (5 cols)
               ======================================================== */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-gradient-to-b from-slate-50 to-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                
                {/* Encabezado del panel multimedia */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#f48f25]" />
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                      Galería de Fotografías
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                    {imagesList.length} {imagesList.length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Sube múltiples imágenes simultáneamente al Storage. Puedes arrastrarlas o moverlas para definir la <strong>Foto Principal</strong> del catálogo.
                </p>

                {/* Banner de Feedback de Subida */}
                {uploadFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-fadeIn ${
                    uploadFeedback.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {uploadFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{uploadFeedback.message}</span>
                  </div>
                )}

                {/* Zona de Arrastrar y Soltar (Dropzone) */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOverArea}
                  onDragLeave={handleDragLeaveArea}
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                    isDragOver
                      ? 'border-[#f48f25] bg-[#f48f25]/10 scale-[1.01]'
                      : 'border-slate-300 hover:border-[#f48f25] bg-slate-50/70 hover:bg-amber-50/40'
                  } ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-2xl bg-[#031834] text-[#f48f25] flex items-center justify-center shadow-md">
                    {uploadingImages ? (
                      <div className="w-6 h-6 border-2 border-[#f48f25] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>

                  <div>
                    <p className="font-extrabold text-sm text-slate-800">
                      {uploadingImages 
                        ? (uploadProgress || 'Subiendo imágenes a Supabase Storage...') 
                        : 'Haz clic o arrastra múltiples fotos aquí'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Soporta JPG, PNG, WEBP • Subida múltiple simultánea directa al Storage
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-sm mt-1">
                    <Plus className="w-3.5 h-3.5 text-[#f48f25]" /> Seleccionar Fotografías del Computador
                  </span>
                </div>

                {/* Botón para abrir entrada manual de URL */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs font-bold text-slate-600 hover:text-[#f48f25] flex items-center gap-1.5 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {showUrlInput ? 'Ocultar enlace por URL' : 'O vincular imagen por enlace URL directo'}
                  </button>
                </div>

                {/* Entrada de URL desplegable */}
                {showUrlInput && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex gap-2 animate-fadeIn">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://ejemplo.com/foto-producto.webp"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#f48f25] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-1.5 rounded-lg bg-[#031834] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                )}

                {/* LISTADO Y REORDENAMIENTO DE FOTOGRAFÍAS */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#f48f25]" />
                      Orden de visualización
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Arrastra o usa las flechas para ordenar
                    </span>
                  </div>

                  {imagesList.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-500">No hay fotos cargadas todavía</p>
                      <p className="text-[10px] text-slate-400">Sube al menos una imagen para tu producto</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {imagesList.map((imgUrl, index) => {
                        const isPrimary = index === 0;

                        return (
                          <div
                            key={`${imgUrl}-${index}`}
                            draggable
                            onDragStart={() => handleItemDragStart(index)}
                            onDragOver={handleItemDragOver}
                            onDrop={() => handleItemDrop(index)}
                            className={`group relative flex items-center gap-3 p-2.5 rounded-2xl border transition-all select-none ${
                              isPrimary
                                ? 'bg-amber-50/60 border-[#f48f25] shadow-sm ring-1 ring-[#f48f25]/40'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            } ${draggedIdx === index ? 'opacity-40 scale-95' : ''}`}
                          >
                            {/* Grip & Indicador de orden */}
                            <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 cursor-grab active:cursor-grabbing pl-1">
                              <GripHorizontal className="w-4 h-4" />
                              <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                                isPrimary ? 'bg-[#031834] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                #{index + 1}
                              </span>
                            </div>

                            {/* Miniatura de la fotografía */}
                            <div className="relative w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewImage(imgUrl)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                title="Ver en grande"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Información y Badge de Estado */}
                            <div className="flex-1 min-w-0">
                              {isPrimary ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f48f25] text-black text-[10px] font-black tracking-wide uppercase shadow-sm">
                                  <Star className="w-3 h-3 fill-black text-black" />
                                  Foto Principal (Portada)
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(index)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#f48f25] transition-colors"
                                  title="Definir como foto de portada"
                                >
                                  <Star className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#f48f25]" />
                                  Hacer Principal
                                </button>
                              )}
                              <p className="text-[10px] text-slate-400 truncate mt-1 font-mono">
                                {imgUrl.startsWith('data:') ? 'Imagen cargada en memoria local' : imgUrl}
                              </p>
                            </div>

                            {/* Botones de Mover y Eliminar */}
                            <div className="flex items-center gap-1 shrink-0 pr-1">
                              {/* Mover hacia arriba / izquierda */}
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveImage(index, 'left')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                title="Mover hacia arriba"
                              >
                                <ArrowLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
                              </button>

                              {/* Mover hacia abajo / derecha */}
                              <button
                                type="button"
                                disabled={index === imagesList.length - 1}
                                onClick={() => handleMoveImage(index, 'right')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                title="Mover hacia abajo"
                              >
                                <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                              </button>

                              {/* Eliminar foto */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                                title="Eliminar fotografía"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* ========================================================
                COLUMNA DERECHA: INFORMACIÓN COMERCIAL, PRECIOS, STOCK (7 cols)
               ======================================================== */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. INFORMACIÓN BÁSICA Y CATEGORIZACIÓN */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-[#031834] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#f48f25]" />
                  Identificación y Clasificación
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Bisagra Parche Inoxidable 304 Cierre Suave"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand || 'FERREINTER'}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Ej. FERREINTER, DEWALT, FORZA"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Código SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      placeholder="Ej. MTR-304"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Categoría *
                    </label>
                    <select
                      value={formData.category || 'bisagras'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Estado de Inventario
                    </label>
                    <select
                      value={formData.inventory_status || 'Disponible'}
                      onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all"
                    >
                      <option value="Disponible">🟢 Disponible</option>
                      <option value="Agotado">🔴 Agotado</option>
                      <option value="Privado">🔒 Privado / Oculto</option>
                      <option value="Bajo Pedido">⏳ Bajo Pedido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. ESTRUCTURA DE PRECIOS EN PESOS COLOMBIANOS (COP) */}
              <div className="bg-gradient-to-br from-amber-50/40 to-orange-50/20 p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#b45309]">
                    Precios Comerciales (COP - Pesos Colombianos)
                  </h4>
                  {formData.price && formData.discount_price && formData.discount_price < formData.price ? (
                    <span className="text-[11px] font-black text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200">
                      -{Math.round(((formData.price - formData.discount_price) / formData.price) * 100)}% de Descuento
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Precio de Venta (COP) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="7800"
                        className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2.5 text-sm font-extrabold text-slate-900 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Precio Mayorista (COP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-emerald-600">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.wholesale_price || ''}
                        onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="6500"
                        className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2.5 text-sm font-extrabold text-emerald-700 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Precio Oferta (COP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-rose-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.discount_price || ''}
                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="7200 (Opcional)"
                        className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2.5 text-sm font-bold text-rose-600 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all placeholder:font-normal"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. DISTRIBUCIÓN DE STOCK MULTISEDE */}
              <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/20 p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-900">
                    Distribución de Stock Multisede
                  </h4>
                  <span className="font-black text-xs text-[#031834] bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-xs">
                    Stock Total: {formData.stock || 0} unidades
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Bodega</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_warehouse ?? 400}
                      onChange={(e) => handleStockChange('stock_warehouse', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Tienda Física</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_store ?? 200}
                      onChange={(e) => handleStockChange('stock_store', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock E-Commerce Web</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_online ?? 400}
                      onChange={(e) => handleStockChange('stock_online', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. ESPECIFICACIONES TÉCNICAS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Ficha Técnica & Atributos
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Garantía</label>
                    <input
                      type="text"
                      value={formData.warranty || ''}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="Ej. 1 AÑO, 5 AÑOS"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Dimensiones</label>
                    <input
                      type="text"
                      value={formData.dimensions || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="Ej. 35MM, 4x3 Pulgadas"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Materiales</label>
                    <input
                      type="text"
                      value={formData.materials || ''}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                      placeholder="Ej. ACERO INOXIDABLE 304"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#f48f25] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Descripción Comercial & Técnica *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe las características técnicas, uso recomendado, compatibilidad y ventajas del producto..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed font-normal text-slate-800 focus:border-[#f48f25] focus:ring-2 focus:ring-[#f48f25]/20 focus:outline-none transition-all resize-y"
                  />
                </div>
              </div>

              {/* 5. VISIBILIDAD Y DESTACADO */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#f48f25] accent-[#f48f25] rounded"
                  />
                  <div>
                    <span className="block font-bold text-xs text-slate-800">Producto Destacado</span>
                    <span className="block text-[11px] text-slate-500">Mostrar en la vitrina principal y ofertas del Home</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== undefined ? formData.is_active : true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#f48f25] accent-[#f48f25] rounded"
                  />
                  <div>
                    <span className="block font-bold text-xs text-slate-800">Producto Activo</span>
                    <span className="block text-[11px] text-slate-500">Visible para clientes en la tienda pública</span>
                  </div>
                </label>
              </div>

            </div>

          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización en tiempo real con Supabase Storage & Catálogo
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={saving || uploadingImages}
                className="px-7 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-black/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#f48f25]" />
                {saving ? 'Guardando en Base de Datos...' : 'Guardar y Publicar Producto'}
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Modal de Previsualización Ampliada de Fotografía */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Vista previa ampliada" 
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
