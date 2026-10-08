import React, { useMemo } from 'react';
import { DollarSign, ShoppingBag, Package, Calendar, TrendingUp, Award, Layers, Inbox } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { Order, Product } from '../../types';

interface AnalyticsProps {
  ordersCount: number;
  totalSalesUSD: number;
  productsCount: number;
  appointmentsCount: number;
  orders?: Order[];
  products?: Product[];
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({
  ordersCount,
  totalSalesUSD,
  productsCount,
  appointmentsCount,
  orders = [],
  products = []
}) => {
  const { formatPrice } = useCurrency();

  // 1. Calcular Top Productos Vendidos a partir de pedidos reales
  const topSellingProducts = useMemo(() => {
    const salesMap: Record<string, { id: string; name: string; sku: string; units: number; revenue: number }> = {};

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      (order.items || []).forEach((item) => {
        const key = item.product_id || item.product_sku || item.product_name;
        if (!salesMap[key]) {
          salesMap[key] = {
            id: item.product_id,
            name: item.product_name,
            sku: item.product_sku,
            units: 0,
            revenue: 0
          };
        }
        salesMap[key].units += item.quantity;
        salesMap[key].revenue += item.subtotal || item.price * item.quantity;
      });
    });

    return Object.values(salesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [orders]);

  // 2. Calcular Distribución de Ventas por Categoría (o por Catálogo si no hay pedidos)
  const categoryDistribution = useMemo(() => {
    const catSales: Record<string, number> = {};
    let totalValue = 0;

    if (orders.length > 0) {
      // Por pedidos reales
      const productCatMap: Record<string, string> = {};
      products.forEach((p) => {
        productCatMap[p.id] = p.category;
        productCatMap[p.sku] = p.category;
      });

      orders.forEach((order) => {
        if (order.status === 'cancelled') return;
        (order.items || []).forEach((item) => {
          const cat = productCatMap[item.product_id] || productCatMap[item.product_sku] || 'Otros';
          const amount = item.subtotal || item.price * item.quantity;
          catSales[cat] = (catSales[cat] || 0) + amount;
          totalValue += amount;
        });
      });
    }

    if (totalValue === 0) {
      // Si no hay ventas aún, mostrar desglose de inventario por categoría
      products.forEach((p) => {
        catSales[p.category] = (catSales[p.category] || 0) + 1;
        totalValue += 1;
      });
    }

    const colors = ['bg-[#f48f25]', 'bg-blue-600', 'bg-emerald-500', 'bg-purple-600', 'bg-slate-700', 'bg-amber-500'];

    return Object.entries(catSales)
      .map(([category, value], idx) => ({
        category,
        percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [orders, products]);

  const KPI_CARDS = [
    {
      title: 'Ventas Totales',
      value: formatPrice(totalSalesUSD),
      subtitle: ordersCount > 0 ? `${ordersCount} pedidos confirmados` : 'Sin ventas aún',
      icon: DollarSign,
      color: 'from-[#f48f25] to-amber-600'
    },
    {
      title: 'Pedidos Procesados',
      value: ordersCount.toString(),
      subtitle: ordersCount > 0 ? 'Flujo de ventas activo' : 'Esperando primer pedido',
      icon: ShoppingBag,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      title: 'Productos en Inventario',
      value: productsCount.toString(),
      subtitle: 'SKUs comerciales activos',
      icon: Package,
      color: 'from-emerald-500 to-teal-700'
    },
    {
      title: 'Asesorías / Citas',
      value: appointmentsCount.toString(),
      subtitle: appointmentsCount > 0 ? 'Citas agendadas' : 'Sin citas agendadas',
      icon: Calendar,
      color: 'from-purple-600 to-indigo-800'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control & Analytics</h2>
        <p className="text-xs text-gray-500 mt-1">Resumen general del rendimiento comercial en tiempo real de FERRE INTER.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 font-mono">{kpi.value}</h3>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Distribución por Categoría */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#f48f25]" />
                {ordersCount > 0 ? 'Distribución de Ventas por Categoría' : 'Distribución de Catálogo por Categoría'}
              </h3>
              <p className="text-xs text-gray-400">
                {ordersCount > 0
                  ? 'Porcentaje sobre el volumen facturado real.'
                  : 'Participación porcentual de productos activos por categoría.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryDistribution.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                <Layers className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                No hay categorías registradas en el catálogo.
              </div>
            ) : (
              categoryDistribution.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1.5 capitalize">
                    <span className="text-slate-700">{cat.category.replace(/-/g, ' ')}</span>
                    <span className="font-mono text-slate-900">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${cat.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Productos Más Vendidos */}
        <div className="lg:col-span-5 bg-[#031834] text-white rounded-2xl p-6 border border-white/10 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-base text-[#f48f25] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f48f25]" />
              Top Productos Más Vendidos
            </h3>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {topSellingProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-gray-500 stroke-[1.5]" />
                <p className="font-bold text-white text-xs">Sin ventas registradas todavía</p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Al generarse pedidos y compras en la tienda, el ranking de productos más vendidos se calculará automáticamente aquí.
                </p>
              </div>
            ) : (
              topSellingProducts.map((p, index) => (
                <div key={p.id || index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-black text-sm text-[#f48f25] w-5 text-center">#{index + 1}</span>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-xs truncate">{p.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      SKU: {p.sku || '-'} • {p.units} {p.units === 1 ? 'Unidad' : 'Unidades'}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-white font-mono">{formatPrice(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
