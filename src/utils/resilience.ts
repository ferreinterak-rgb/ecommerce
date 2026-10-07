/**
 * Utilidades de Resiliencia para E-Commerce (FERREINTER)
 * Garantiza tolerancia a errores, coincidencia flexible de categorías y cálculos seguros.
 */

/**
 * Comparador flexible de categorías que previene que productos o fotos se oculten
 * ante diferencias de mayúsculas/minúsculas, tildes, signos de puntuación o variaciones como 'y' vs '&'.
 */
export function isCategoryMatch(catA?: string | null, catB?: string | null): boolean {
  if (!catA || !catB) return false;
  if (catA === 'all' || catB === 'all') return true;

  const clean = (str: string): string =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos/tildes
      .replace(/&/g, 'y')
      .replace(/[^a-z0-9]/g, ''); // Conservar solo caracteres alfanuméricos

  const a = clean(catA);
  const b = clean(catB);

  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Deducción de inventario segura y cálculo de estado
 */
export function calculateNewStock(currentStock: number, quantitySold: number) {
  const newStock = Math.max(0, (currentStock || 0) - quantitySold);
  const newStatus = newStock === 0 ? 'Agotado' : newStock <= 3 ? 'Bajo Pedido' : 'Disponible';
  return { newStock, newStatus };
}
