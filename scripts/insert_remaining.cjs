const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://clufybkujyzhzffpymti.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdWZ5Ymt1anl6aHpmZnB5bXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Nzg4NjEsImV4cCI6MjEwNjQ1NDg2MX0.xsqLUK3RI5S7M2I_lR-QStUScCye3WcPK4-VbDTJtvQ';
const supabase = createClient(url, key);

function normalizeStr(str) {
  if (!str) return '';
  return str.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const CATEGORY_MAP = {
  'BISAGRAS': 'bisagras',
  'PLACAS': 'placas-reparacion',
  'CHAPAS': 'chapas',
  'CERRADURAS': 'chapas',
  'BROCA': 'brocas-accesorios',
  'TOPES BROCA': 'brocas-accesorios',
  'PRENSA': 'prensas-fijacion',
  'DISCOS': 'discos-corte',
  'ESCUADRA': 'escuadras-medicion',
  'SOPORTE': 'herrajes-carpinteria',
  'HERRAMIENTA ELECTRICA': 'herramientas-electricas',
  'HERRAMIENTA MANUAL': 'herramientas-manuales',
  'HERRAMIENTA PARA MEDIR': 'medicion-nivelacion',
  'FRESAS PARA MADERA': 'fresas-madera',
  'CLAVOS': 'fijaciones-clavos',
  'TOPES PUERTA': 'topes-puerta',
  'ACCESORIOS BAÑO': 'accesorios-banos',
  'PEGANTES': 'adhesivos-pegantes',
  'LUBRICANTES': 'lubricantes-quimicos',
  'GAS': 'gas-sopletes',
  'RIELES PARA CAJON O CORREDERAS': 'rieles-correderas',
  'LOCERO O PLATERO': 'organizacion-cocina',
  'MASILLA MADERA': 'masillas-acabados',
  'PATAS': 'patas-niveladores'
};

const CATEGORY_FALLBACK_IMAGES = {
  'fresas-madera': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'bisagras': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
};

async function insertRemaining() {
  const { data: dbProducts } = await supabase.from('products').select('*');
  const dbSkus = new Set(dbProducts.map(p => (p.sku || '').trim().toUpperCase()));
  const dbSlugs = new Set(dbProducts.map(p => (p.slug || '').trim().toLowerCase()));

  const EXCEL_PATH = '/Users/macbook/.gemini/antigravity/brain/68269046-09f6-44fd-887b-14bfdf298ce7/.user_uploaded/media_1795297916841_6b0e2bb6.xlsx';
  const wb = XLSX.readFile(EXCEL_PATH);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });

  let inserted = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    let sku = (r[1] || '').toString().trim();
    const brand = (r[2] || 'FERREINTER').toString().trim();
    const name = (r[3] || '').toString().trim();
    const desc = (r[4] || '').toString().trim();
    const rawCat = (r[5] || '').toString().trim().toUpperCase();
    const catSlug = CATEGORY_MAP[rawCat] || 'fresas-madera';
    const price = Number(r[6] || 0);
    const offerPriceRaw = Number(r[7] || price);
    const discountPrice = offerPriceRaw < price ? offerPriceRaw : null;
    const wholesalePrice = Number(r[8] || 0);

    const stockTotal = Number(r[9] || 1000);
    const stockWarehouse = Number(r[10] || 400);
    const stockStore = Number(r[11] || 200);
    const stockWeb = Number(r[12] || 400);
    const warranty = (r[13] || '').toString().trim() || null;
    const status = (r[14] || 'Disponible').toString().trim() || 'Disponible';
    const dimensions = (r[15] || '').toString().trim() || null;
    const materials = (r[16] || '').toString().trim() || null;

    let skuUpper = sku.toUpperCase();

    // Si el SKU ya está en DB
    if (dbSkus.has(skuUpper)) {
      const existing = dbProducts.find(p => (p.sku || '').toUpperCase() === skuUpper);
      if (existing && normalizeStr(existing.name) === normalizeStr(name)) {
        skipped++;
        continue;
      }
      // Si es el mismo SKU pero diferente nombre/medida (ej. 709-21 con diferente diámetro)
      sku = sku + '-' + (dimensions ? slugify(dimensions) : 'b');
      skuUpper = sku.toUpperCase();
      if (dbSkus.has(skuUpper)) {
        skipped++;
        continue;
      }
    }

    let baseSlug = slugify(name) + '-' + slugify(sku);
    let finalSlug = baseSlug;
    let counter = 1;
    while (dbSlugs.has(finalSlug)) {
      finalSlug = baseSlug + '-' + counter;
      counter++;
    }

    const item = {
      sku,
      name,
      slug: finalSlug,
      brand: brand || 'FERREINTER',
      description: desc,
      category: catSlug,
      price,
      discount_price: discountPrice,
      wholesale_price: wholesalePrice,
      stock_qty: stockTotal,
      stock_warehouse: stockWarehouse,
      stock_store: stockStore,
      stock_online: stockWeb,
      warranty,
      dimensions,
      materials,
      inventory_status: status,
      images: [CATEGORY_FALLBACK_IMAGES[catSlug] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'],
      is_featured: false,
      is_active: true,
      rating: 5.0,
      reviews_count: 0
    };

    const { error } = await supabase.from('products').insert(item);
    if (error) {
      console.error('Error insertando SKU ' + sku + ':', error.message);
    } else {
      dbSkus.add(skuUpper);
      dbSlugs.add(finalSlug);
      inserted++;
    }
  }

  console.log('Finalizado: Insertados: ' + inserted + ', Omitidos (duplicados exactos en excel): ' + skipped);
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('Total final de productos en Supabase:', count);
}

insertRemaining().catch(console.error);
