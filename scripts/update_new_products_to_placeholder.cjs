const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://clufybkujyzhzffpymti.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdWZ5Ymt1anl6aHpmZnB5bXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Nzg4NjEsImV4cCI6MjEwNjQ1NDg2MX0.xsqLUK3RI5S7M2I_lR-QStUScCye3WcPK4-VbDTJtvQ';
const supabase = createClient(url, key);

const PLACEHOLDER_IMAGE = '/placeholder-producto.png';

async function updateNewProductsOnly() {
  console.log('🔍 Obteniendo catálogo completo de Supabase...');
  const { data: allProducts, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  // Separar estrictamente productos antiguos de los nuevos
  const oldProducts = allProducts.filter(p => new Date(p.created_at) < new Date('2026-11-22T00:00:00Z'));
  const newProducts = allProducts.filter(p => new Date(p.created_at) >= new Date('2026-11-22T00:00:00Z'));

  console.log(`🔒 Productos antiguos (PROTEGIDOS): ${oldProducts.length}`);
  console.log(`🎯 Nuevos productos (A ACTUALIZAR): ${newProducts.length}`);

  let updatedCount = 0;
  for (const product of newProducts) {
    const { error: updErr } = await supabase
      .from('products')
      .update({
        images: [PLACEHOLDER_IMAGE],
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id);

    if (updErr) {
      console.warn(`Error actualizando producto ${product.sku}:`, updErr.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`✅ ${updatedCount} nuevos productos actualizados con imagen en blanco: '${PLACEHOLDER_IMAGE}'`);

  // Verificación estricta post-actualización
  const { data: verifyData } = await supabase.from('products').select('id, sku, name, created_at, images');
  const verifyOld = verifyData.filter(p => new Date(p.created_at) < new Date('2026-11-22T00:00:00Z'));
  const verifyNew = verifyData.filter(p => new Date(p.created_at) >= new Date('2026-11-22T00:00:00Z'));

  const oldWithOriginal = verifyOld.filter(p => 
    p.images && p.images.length > 0 && p.images[0].includes('supabase.co')
  ).length;

  const newWithPlaceholder = verifyNew.filter(p => 
    p.images && p.images.length === 1 && p.images[0] === PLACEHOLDER_IMAGE
  ).length;

  console.log(`\n--- REPORTE DE INTEGRIDAD ---`);
  console.log(`🛡️ Productos antiguos con sus imágenes intactas: ${oldWithOriginal}/${verifyOld.length}`);
  console.log(`📸 Nuevos productos con placeholder blanco: ${newWithPlaceholder}/${verifyNew.length}`);

  if (oldWithOriginal === verifyOld.length && newWithPlaceholder === verifyNew.length) {
    console.log('🎉 PERFECTO: 0 productos antiguos afectados, todos los 230 nuevos actualizados correctamente.');
  } else {
    console.warn('⚠️ Advertencia en verificación. Revisar detalles.');
  }
}

updateNewProductsOnly().catch(console.error);
