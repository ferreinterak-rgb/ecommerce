const fs = require('fs');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://clufybkujyzhzffpymti.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdWZ5Ymt1anl6aHpmZnB5bXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Nzg4NjEsImV4cCI6MjEwNjQ1NDg2MX0.xsqLUK3RI5S7M2I_lR-QStUScCye3WcPK4-VbDTJtvQ';
const supabase = createClient(url, key);

const EXCEL_PATH = '/Users/macbook/.gemini/antigravity/brain/68269046-09f6-44fd-887b-14bfdf298ce7/.user_uploaded/media_1795297916841_6b0e2bb6.xlsx';

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
  'bisagras': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'chapas': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
  'discos-corte': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  'prensas-fijacion': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'brocas-accesorios': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  'escuadras-medicion': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
  'placas-reparacion': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
  'herrajes-carpinteria': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
  'fresas-madera': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'rieles-correderas': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
  'adhesivos-pegantes': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
  'organizacion-cocina': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  'patas-niveladores': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'fijaciones-clavos': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
  'herramientas-electricas': '/dewalt-drill-kit.jpg',
  'herramientas-manuales': '/truper-toolbox.png',
  'medicion-nivelacion': '/truper-flexometro.png',
  'masillas-acabados': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'lubricantes-quimicos': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
  'topes-puerta': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'accesorios-banos': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'gas-sopletes': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
};

async function run() {
  console.log('🚀 Iniciando Opción A: Sincronización e Importación del Catálogo Maestro...');

  // 1. Obtener estado actual de Supabase
  const { data: dbProducts, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error('❌ Error consultando Supabase:', fetchErr);
    process.exit(1);
  }
  console.log(`📦 Productos actualmente en Supabase: ${dbProducts.length}`);

  const dbBySku = new Map();
  const dbByName = new Map();
  const existingSlugs = new Set();

  dbProducts.forEach(p => {
    if (p.sku) dbBySku.set(p.sku.trim().toUpperCase(), p);
    if (p.name) dbByName.set(normalizeStr(p.name), p);
    if (p.slug) existingSlugs.add(p.slug.toLowerCase());
  });

  // 2. Leer archivo Excel
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`📊 Filas leídas del archivo Excel: ${rows.length - 1}`);

  let updatedCount = 0;
  let insertedCount = 0;
  const newProductsBatch = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const sku = (r[1] || '').toString().trim();
    const brand = (r[2] || 'FERREINTER').toString().trim();
    const name = (r[3] || '').toString().trim();
    const desc = (r[4] || '').toString().trim();
    const rawCat = (r[5] || '').toString().trim().toUpperCase();
    const catSlug = CATEGORY_MAP[rawCat] || 'bisagras';

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

    const skuUpper = sku.toUpperCase();
    const normName = normalizeStr(name);

    let match = dbBySku.get(skuUpper);
    if (!match && dbByName.has(normName)) {
      match = dbByName.get(normName);
    }

    if (match) {
      // 3. Actualizar producto existente
      const updatePayload = {
        price,
        discount_price: discountPrice,
        wholesale_price: wholesalePrice,
        stock_qty: stockTotal,
        stock_warehouse: stockWarehouse,
        stock_store: stockStore,
        stock_online: stockWeb,
        updated_at: new Date().toISOString()
      };
      if (warranty) updatePayload.warranty = warranty;
      if (dimensions) updatePayload.dimensions = dimensions;
      if (materials) updatePayload.materials = materials;

      const { error: updErr } = await supabase.from('products').update(updatePayload).eq('id', match.id);
      if (updErr) {
        console.warn(`⚠️ Error actualizando SKU ${sku} (${name}):`, updErr.message);
      } else {
        updatedCount++;
      }
    } else {
      // 4. Preparar nuevo producto
      let baseSlug = `${slugify(name)}-${slugify(sku)}`;
      if (!baseSlug || baseSlug === '-') {
        baseSlug = `prod-${slugify(sku) || Date.now()}`;
      }
      let finalSlug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      existingSlugs.add(finalSlug);

      const fallbackImg = CATEGORY_FALLBACK_IMAGES[catSlug] || '/dewalt-chopsaw.jpg';

      newProductsBatch.push({
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
        images: [fallbackImg],
        is_featured: false,
        is_active: true,
        rating: 5.0,
        reviews_count: 0
      });
    }
  }

  console.log(`✅ Productos existentes actualizados: ${updatedCount}`);
  console.log(`✨ Nuevos productos a insertar: ${newProductsBatch.length}`);

  // 5. Inserción por lotes
  const BATCH_SIZE = 25;
  for (let i = 0; i < newProductsBatch.length; i += BATCH_SIZE) {
    const batch = newProductsBatch.slice(i, i + BATCH_SIZE);
    const { data: inserted, error: insErr } = await supabase.from('products').insert(batch).select();
    if (insErr) {
      console.error(`❌ Error insertando lote ${i / BATCH_SIZE + 1}:`, insErr.message);
    } else {
      insertedCount += (inserted ? inserted.length : batch.length);
      console.log(`  -> Lote ${Math.floor(i / BATCH_SIZE) + 1} insertado (${insertedCount}/${newProductsBatch.length})`);
    }
  }

  // 6. Verificación final en Supabase
  const { count: finalCount, error: cntErr } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 Sincronización completada con éxito!`);
  console.log(`📊 Total final de productos en Supabase: ${finalCount}`);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
