import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Comprime una imagen en el navegador para que pese poco (<150KB) y no sature almacenamiento ni ancho de banda.
 */
export const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Genera WebP o JPEG comprimido
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Sube una imagen a Supabase Storage (bucket 'products').
 * Si Supabase Storage aún no tiene el bucket o falla, usa compresión local resiliente (Data URL).
 */
export const uploadProductImage = async (file: File): Promise<{ url: string; isCloud: boolean }> => {
  // 1. Siempre comprimimos la imagen para optimizar el tamaño
  const compressedDataUrl = await compressImage(file);

  // 2. Si Supabase está configurado, intentar subir al Storage
  if (isSupabaseConfigured()) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const filePath = `catalog/${Date.now()}_${cleanName}.${ext}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from('products').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return { url: pubData.publicUrl, isCloud: true };
        }
      } else {
        console.warn('Supabase storage fallback to local compressed image:', error?.message);
      }
    } catch (e) {
      console.warn('Error subiendo imagen a Supabase Storage, usando respaldo resiliente:', e);
    }
  }

  // 3. Respaldo resiliente: URL en base64 comprimida (<150KB)
  return { url: compressedDataUrl, isCloud: false };
};
