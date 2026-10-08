import * as XLSX from 'xlsx';
import { Product } from '../types';

export interface ParsedImportRow {
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  wholesale_price?: number;
  discount_price?: number;
  stock: number;
  stock_warehouse?: number;
  stock_store?: number;
  stock_online?: number;
  warranty?: string;
  dimensions?: string;
  materials?: string;
  description?: string;
  images?: string[];
  inventory_status?: string;
}

export interface ParsedImportResult {
  valid: ParsedImportRow[];
  errors: { row: number; error: string; raw: any }[];
  totalRows: number;
}

/**
 * Normaliza nombres de columnas de Excel eliminando acentos, espacios y caracteres especiales
 */
const normalizeKey = (key: string): string => {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]/g, '_');
};

/**
 * Exporta el catálogo completo a un archivo Excel (.xlsx)
 */
export const exportProductsToExcel = (products: Product[], filename = 'inventario_ferre_inter.xlsx') => {
  const data = products.map((p, index) => ({
    '#': index + 1,
    'SKU': p.sku,
    'NOMBRE': p.name,
    'CATEGORÍA': p.category,
    'MARCA': p.brand,
    'PRECIO VENTA (COP)': p.price,
    'PRECIO MAYORISTA (COP)': p.wholesale_price || '',
    'PRECIO OFERTA (COP)': p.discount_price || '',
    'STOCK TOTAL': p.stock,
    'STOCK BODEGA': p.stock_warehouse ?? '',
    'STOCK TIENDA': p.stock_store ?? '',
    'STOCK WEB': p.stock_online ?? '',
    'DIMENSIONES / MEDIDA': p.dimensions || '',
    'MATERIALES / ACABADO': p.materials || '',
    'ESTADO': p.inventory_status || 'Disponible',
    'GARANTÍA': p.warranty || '',
    'DESCRIPCIÓN': p.description || '',
    'IMÁGENES (URLs)': (p.images || []).join(';')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

  // Ajustar anchos de columnas
  const colWidths = [
    { wch: 4 },  // #
    { wch: 16 }, // SKU
    { wch: 40 }, // NOMBRE
    { wch: 22 }, // CATEGORIA
    { wch: 15 }, // MARCA
    { wch: 18 }, // PRECIO VENTA
    { wch: 22 }, // PRECIO MAYORISTA
    { wch: 20 }, // PRECIO OFERTA
    { wch: 14 }, // STOCK TOTAL
    { wch: 14 }, // STOCK BODEGA
    { wch: 14 }, // STOCK TIENDA
    { wch: 14 }, // STOCK WEB
    { wch: 24 }, // DIMENSIONES
    { wch: 24 }, // MATERIALES
    { wch: 14 }, // ESTADO
    { wch: 20 }, // GARANTIA
    { wch: 50 }, // DESCRIPCION
    { wch: 40 }  // IMAGENES
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
};

/**
 * Exporta el catálogo a un archivo CSV estándar
 */
export const exportProductsToCSV = (products: Product[], filename = 'inventario_ferre_inter.csv') => {
  const data = products.map((p) => ({
    'SKU': p.sku,
    'NOMBRE': p.name,
    'CATEGORÍA': p.category,
    'MARCA': p.brand,
    'PRECIO VENTA': p.price,
    'PRECIO MAYORISTA': p.wholesale_price || '',
    'PRECIO OFERTA': p.discount_price || '',
    'STOCK TOTAL': p.stock,
    'DIMENSIONES': p.dimensions || '',
    'MATERIALES': p.materials || '',
    'GARANTÍA': p.warranty || '',
    'DESCRIPCIÓN': p.description || '',
    'IMÁGENES': (p.images || []).join(';')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Genera y descarga una plantilla modelo en Excel (.xlsx) con datos de ejemplo
 */
export const downloadImportTemplateExcel = () => {
  const templateData = [
    {
      'SKU': 'BIS-INOX-35',
      'NOMBRE': 'Bisagra Oculta de Acero Inoxidable 35mm Cierre Suave',
      'CATEGORÍA': 'bisagras',
      'MARCA': 'FERREINTER',
      'PRECIO VENTA': 8500,
      'PRECIO MAYORISTA': 6500,
      'PRECIO OFERTA': 7900,
      'STOCK TOTAL': 150,
      'STOCK BODEGA': 100,
      'STOCK TIENDA': 50,
      'STOCK WEB': 0,
      'DIMENSIONES / MEDIDA': '35mm',
      'MATERIALES / ACABADO': 'Acero Inoxidable 304',
      'GARANTÍA': '1 año directo de fábrica',
      'DESCRIPCIÓN': 'Bisagra de alta precisión para muebles de cocina y carpintería fina.',
      'IMÁGENES (URLs)': 'https://ejemplo.com/foto1.jpg;https://ejemplo.com/foto2.jpg'
    },
    {
      'SKU': 'DISC-CORTE-45',
      'NOMBRE': 'Disco de Corte Fino Metal 4-1/2" Extra Duración',
      'CATEGORÍA': 'discos-corte',
      'MARCA': 'FORZA',
      'PRECIO VENTA': 3200,
      'PRECIO MAYORISTA': 2400,
      'PRECIO OFERTA': '',
      'STOCK TOTAL': 300,
      'STOCK BODEGA': 250,
      'STOCK TIENDA': 50,
      'STOCK WEB': 0,
      'DIMENSIONES / MEDIDA': '4-1/2 pulgadas (115mm)',
      'MATERIALES / ACABADO': 'Óxido de Aluminio Reforzado',
      'GARANTÍA': 'Garantía de rendimiento',
      'DESCRIPCIÓN': 'Corte rápido y limpio sin rebabas para metales e inoxidables.',
      'IMÁGENES (URLs)': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
  XLSX.writeFile(workbook, 'plantilla_importacion_productos_ferreinter.xlsx');
};

/**
 * Parsea e interpreta un archivo .xlsx o .csv cargado por el usuario
 */
export const parseImportFile = async (file: File): Promise<ParsedImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const valid: ParsedImportRow[] = [];
        const errors: { row: number; error: string; raw: any }[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // Considerando fila 1 de encabezados
          const normalized: Record<string, any> = {};

          Object.keys(row).forEach((key) => {
            normalized[normalizeKey(key)] = row[key];
          });

          // Buscar SKU
          const sku = String(
            normalized['sku'] ||
            normalized['codigo'] ||
            normalized['referencia'] ||
            normalized['ref'] ||
            ''
          ).trim();

          // Buscar Nombre
          const name = String(
            normalized['nombre'] ||
            normalized['name'] ||
            normalized['producto'] ||
            normalized['descripcion_corta'] ||
            ''
          ).trim();

          // Buscar Precio
          const rawPrice = normalized['precio_venta__cop_'] ??
            normalized['precio_venta'] ??
            normalized['precio'] ??
            normalized['price'] ??
            '';
          const price = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ''));

          // Validación básica obligatoria
          if (!sku) {
            errors.push({ row: rowNum, error: 'Falta el SKU / Código del producto', raw: row });
            return;
          }

          if (!name) {
            errors.push({ row: rowNum, error: 'Falta el Nombre del producto', raw: row });
            return;
          }

          if (isNaN(price) || price < 0) {
            errors.push({ row: rowNum, error: `Precio inválido o vacío (${rawPrice})`, raw: row });
            return;
          }

          // Precio Mayorista
          const rawWholesale = normalized['precio_mayorista__cop_'] ??
            normalized['precio_mayorista'] ??
            normalized['precio_por_mayor'] ??
            normalized['wholesale_price'] ??
            '';
          const wholesale_price = rawWholesale ? parseFloat(String(rawWholesale).replace(/[^0-9.-]+/g, '')) : undefined;

          // Precio Oferta
          const rawDiscount = normalized['precio_oferta__cop_'] ??
            normalized['precio_oferta'] ??
            normalized['precio_descuento'] ??
            normalized['discount_price'] ??
            '';
          const discount_price = rawDiscount ? parseFloat(String(rawDiscount).replace(/[^0-9.-]+/g, '')) : undefined;

          // Stock Total
          const rawStock = normalized['stock_total'] ??
            normalized['stock'] ??
            normalized['cantidad'] ??
            0;
          const stock = parseInt(String(rawStock).replace(/[^0-9-]+/g, ''), 10) || 0;

          // Stock Desglosado
          const stock_warehouse = parseInt(String(normalized['stock_bodega'] ?? ''), 10) || undefined;
          const stock_store = parseInt(String(normalized['stock_tienda'] ?? ''), 10) || undefined;
          const stock_online = parseInt(String(normalized['stock_web'] ?? ''), 10) || undefined;

          // Marca
          const brand = String(
            normalized['marca'] ||
            normalized['brand'] ||
            'FERREINTER'
          ).trim();

          // Categoría
          const category = String(
            normalized['categoria'] ||
            normalized['category'] ||
            'herrajes-carpinteria'
          ).trim().toLowerCase().replace(/\s+/g, '-');

          // Dimensiones / Medida
          const dimensions = String(
            normalized['dimensiones___medida'] ||
            normalized['dimensiones'] ||
            normalized['medida'] ||
            normalized['size'] ||
            ''
          ).trim();

          // Materiales / Acabado
          const materials = String(
            normalized['materiales___acabado'] ||
            normalized['materiales'] ||
            normalized['acabado'] ||
            normalized['material'] ||
            ''
          ).trim();

          // Garantía
          const warranty = String(
            normalized['garantia'] ||
            normalized['warranty'] ||
            ''
          ).trim();

          // Descripción
          const description = String(
            normalized['descripcion'] ||
            normalized['description'] ||
            ''
          ).trim();

          // Imágenes (separadas por ; o coma)
          const rawImages = String(
            normalized['imagenes__urls_'] ||
            normalized['imagenes'] ||
            normalized['images'] ||
            ''
          ).trim();
          const images = rawImages ? rawImages.split(/[;,]/).map((u) => u.trim()).filter(Boolean) : undefined;

          valid.push({
            sku,
            name,
            brand,
            category,
            price,
            wholesale_price: isNaN(wholesale_price as number) ? undefined : wholesale_price,
            discount_price: isNaN(discount_price as number) ? undefined : discount_price,
            stock,
            stock_warehouse,
            stock_store,
            stock_online,
            dimensions: dimensions || undefined,
            materials: materials || undefined,
            warranty: warranty || undefined,
            description: description || undefined,
            images,
            inventory_status: stock > 0 ? 'Disponible' : 'Agotado'
          });
        });

        resolve({
          valid,
          errors,
          totalRows: rawJson.length
        });
      } catch (err: any) {
        reject(new Error(`Error al leer el archivo Excel: ${err?.message || err}`));
      }
    };

    reader.onerror = () => reject(new Error('No se pudo leer el archivo cargado'));
    reader.readAsBinaryString(file);
  });
};
