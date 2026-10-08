import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { parseImportFile, downloadImportTemplateExcel, ParsedImportResult, ParsedImportRow } from '../../utils/excelService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProducts: Product[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProducts
}) => {
  const { formatPrice } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsedImportResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<{ success: number; errors: number } | null>(null);

  if (!isOpen) return null;

  const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));

  const handleFileSelect = async (selectedFile: File) => {
    setErrorMsg(null);
    setSuccessReport(null);
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const result = await parseImportFile(selectedFile);
      setParseResult(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error procesando el archivo.');
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadProgress({ current: 0, total: parseResult.valid.length });

    try {
      const report = await productService.bulkUpsertProducts(parseResult.valid, (processed, total) => {
        setUploadProgress({ current: processed, total });
      });

      setSuccessReport({ success: report.successCount, errors: report.errorCount });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(`Error en la importación: ${err?.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setErrorMsg(null);
    setSuccessReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#031834] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#f48f25]">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Importación Masiva de Productos</h3>
              <p className="text-[11px] text-gray-300">Carga o actualiza múltiples productos mediante Excel (.xlsx) o CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Subheader info & template download button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f7f5] p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="font-bold text-slate-800">¿No tienes la plantilla oficial?</p>
              <p className="text-[11px] text-gray-500">Descarga la plantilla con las columnas exactas (SKU, Nombre, Precios, Stock, etc.).</p>
            </div>
            <button
              onClick={downloadImportTemplateExcel}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-800 border border-gray-200 font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#f48f25]" /> Descargar Plantilla Excel
            </button>
          </div>

          {/* Estado 1: Carga de Archivo Drag & Drop */}
          {!parseResult && !isParsing && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-[#f48f25] rounded-3xl p-10 text-center cursor-pointer bg-gray-50/50 hover:bg-[#f48f25]/5 transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto text-[#f48f25]">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Arrastra tu archivo aquí o haz clic para explorar</p>
                <p className="text-gray-400 text-xs mt-1">Soporta formatos .xlsx, .xls y .csv</p>
              </div>
            </div>
          )}

          {/* Loader de Procesamiento del Archivo */}
          {isParsing && (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#f48f25]" />
              <p className="font-bold text-slate-800">Leyendo y validando datos del archivo...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Error en la importación</p>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Reporte de Éxito */}
          {successReport && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">¡Importación completada con éxito!</p>
                <p className="text-xs text-emerald-700">
                  Se procesaron {successReport.success} productos correctamente.
                </p>
              </div>
            </div>
          )}

          {/* Previsualización de Datos Parseados */}
          {parseResult && !successReport && (
            <div className="space-y-4">
              
              {/* Resumen de Filas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Filas</span>
                  <span className="text-lg font-black text-slate-900">{parseResult.totalRows}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold block uppercase">Válidos para Subir</span>
                  <span className="text-lg font-black text-emerald-700">{parseResult.valid.length}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold block uppercase">A Actualizar (Existentes)</span>
                  <span className="text-lg font-black text-blue-700">
                    {parseResult.valid.filter(r => existingSkus.has(r.sku.toUpperCase())).length}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] text-amber-600 font-bold block uppercase">Filas con Errores</span>
                  <span className="text-lg font-black text-amber-700">{parseResult.errors.length}</span>
                </div>
              </div>

              {/* Errores encontrados (si los hay) */}
              {parseResult.errors.length > 0 && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Se omitirán {parseResult.errors.length} filas con datos faltantes o incorrectos:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                    {parseResult.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>
                        <strong>Fila {err.row}:</strong> {err.error}
                      </li>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <li className="font-semibold">... y {parseResult.errors.length - 10} filas más.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Tabla de Preview (Primeras 8 filas) */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#f8f7f5] px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-800">Vista Previa de Productos</span>
                  <span className="text-[10px] text-gray-500">Mostrando hasta 8 registros</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[9px]">
                      <tr>
                        <th className="p-2.5">Acción</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Nombre</th>
                        <th className="p-2.5">Categoría</th>
                        <th className="p-2.5">Precio Venta</th>
                        <th className="p-2.5">Precio Mayor</th>
                        <th className="p-2.5 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {parseResult.valid.slice(0, 8).map((row, idx) => {
                        const isUpdate = existingSkus.has(row.sku.toUpperCase());
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isUpdate ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {isUpdate ? 'Actualizar' : 'Crear'}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{row.sku}</td>
                            <td className="p-2.5 font-sans font-medium text-slate-800 max-w-[200px] truncate">{row.name}</td>
                            <td className="p-2.5 text-gray-500">{row.category}</td>
                            <td className="p-2.5 font-bold text-slate-900">{formatPrice(row.price)}</td>
                            <td className="p-2.5 text-emerald-700 font-bold">{row.wholesale_price ? formatPrice(row.wholesale_price) : '-'}</td>
                            <td className="p-2.5 text-center font-bold">{row.stock}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Barra de Progreso durante la Subida */}
          {isUploading && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex justify-between font-bold text-xs text-slate-800">
                <span>Guardando productos en la base de datos...</span>
                <span>{uploadProgress.current} / {uploadProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#f48f25] h-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {parseResult ? (
            <button
              onClick={handleReset}
              disabled={isUploading}
              className="text-xs text-gray-500 hover:text-black font-semibold"
            >
              Cargar otro archivo
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            {parseResult && !successReport && (
              <button
                onClick={handleConfirmImport}
                disabled={isUploading || parseResult.valid.length === 0}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#f48f25]" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirmar e Importar ({parseResult.valid.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
