import React from 'react';
import { DollarSign, ShoppingBag, Package, Calendar, TrendingUp, ArrowUpRight, Award, Users } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface AnalyticsProps {
  ordersCount: number;
  totalSalesUSD: number;
  productsCount: number;
  appointmentsCount: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({
  ordersCount,
  totalSalesUSD,
  productsCount,
  appointmentsCount
}) => {
  const { formatPrice } = useCurrency();

  const KPI_CARDS = [
    {
      title: 'Ventas Totales',
      value: formatPrice(totalSalesUSD),
      growth: '+24.5%',
      icon: DollarSign,
      color: 'from-[#f48f25] to-amber-600',
      textColor: 'text-[#f48f25]'
    },
    {
      title: 'Pedidos Procesados',
      value: ordersCount.toString(),
      growth: '+12.8%',
      icon: ShoppingBag,
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-400'
    },
    {
      title: 'Productos en Inventario',
      value: productsCount.toString(),
      growth: 'Activo',
      icon: Package,
      color: 'from-emerald-500 to-teal-700',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Asesorías / Citas',
      value: appointmentsCount.toString(),
      growth: 'Agendadas',
      icon: Calendar,
      color: 'from-purple-600 to-indigo-800',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control & Analytics</h2>
        <p className="text-xs text-gray-500 mt-1">Resumen general del rendimiento comercial de FERRE INTER.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-slate-900">{kpi.value}</h3>
                <span className="flex items-center text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {kpi.growth}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown Charts / Visual Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales by Category Progress Bar Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#f48f25]" />
                Distribución de Ventas por Categoria
              </h3>
              <p className="text-xs text-gray-400">Porcentaje de ventas acumuladas este mes.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Herramientas Eléctricas & Inalámbricas</span>
                <span className="text-[#f48f25]">42%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-[#f48f25] h-full rounded-full w-[42%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Herramientas Manuales & Juegos</span>
                <span className="text-blue-600">28%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[28%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Plomería & Grifería Industrial</span>
                <span className="text-emerald-600">18%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[18%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Seguridad & Cerrajería Digital</span>
                <span className="text-purple-600">12%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full w-[12%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Featured Products */}
        <div className="lg:col-span-5 bg-[#031834] text-white rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-base text-[#f48f25] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f48f25]" />
              Top Productos Más Vendidos
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-black text-sm text-[#f48f25] w-5 text-center">#1</span>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs truncate">Taladro Percutor DeWalt 20V Max XR</h4>
                <p className="text-[10px] text-gray-400">SKU: DCD996B-20V • 42 Vendidos</p>
              </div>
              <span className="font-bold text-xs text-white">{formatPrice(199.00)}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-black text-sm text-[#f48f25] w-5 text-center">#2</span>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs truncate">Cinta Métrica Stanley 25ft PowerLock</h4>
                <p className="text-[10px] text-gray-400">SKU: ST-33-425 • 84 Vendidos</p>
              </div>
              <span className="font-bold text-xs text-white">{formatPrice(24.99)}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-black text-sm text-[#f48f25] w-5 text-center">#3</span>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs truncate">Escalera de Tijera Werner 6 ft.</h4>
                <p className="text-[10px] text-gray-400">SKU: WERN-6FT-AL • 15 Vendidos</p>
              </div>
              <span className="font-bold text-xs text-white">{formatPrice(129.00)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
