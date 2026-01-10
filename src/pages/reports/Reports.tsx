// pages/ReportsPage.tsx
import { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { ReportService } from '../../services/report.service';
import type { GeneralReportResponse, DailyIncomeItem } from '../../services/report.service';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Últimos 30 días por defecto
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [generalReport, setGeneralReport] = useState<GeneralReportResponse | null>(null);
  const [dailyIncome, setDailyIncome] = useState<DailyIncomeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Debe seleccionar un rango de fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [general, daily] = await Promise.all([
        ReportService.getGeneralReport(startDate, endDate, branchId),
        ReportService.getDailyIncomeReport(startDate, endDate, branchId)
      ]);

      setGeneralReport(general);
      setDailyIncome(daily);
    } catch (err: any) {
      console.error('Error generando reporte:', err);
      setError(err.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-BO').format(num);
  };

  const getTopDays = (items: DailyIncomeItem[], count: number = 5) => {
    return [...items]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, count);
  };



  const getBranchName = (id?: number): string => {
    if (!id) return 'Todas las sucursales';
    return id === 1 ? 'Flora 13' : 'Flora 8';
  };

  const getDaysBetween = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <DocumentChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
              <p className="text-gray-600 mt-1">Análisis detallado de ventas, pedidos e ingresos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Filtros del Reporte</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Fecha Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Fecha Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BuildingStorefrontIcon className="w-4 h-4 inline mr-2" />
              Sucursal
            </label>
            <select
              value={branchId || ''}
              onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las sucursales</option>
              <option value="1">Flora 13</option>
              <option value="2">Flora 8</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <ChartBarIcon className="w-5 h-5" />
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {generalReport && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">
              Reporte generado para {getBranchName(branchId)} del {formatDateForDisplay(startDate)} al {formatDateForDisplay(endDate)}
              <span className="text-blue-600 ml-2">
                ({getDaysBetween(startDate, endDate)} días)
              </span>
            </p>
          </div>
        )}
      </div>

      {generalReport && (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ventas Totales */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      generalReport.sales.total_sales > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {generalReport.sales.total_sales} ventas
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Ventas Totales</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(generalReport.sales.total_amount)}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {formatNumber(generalReport.sales.total_sales)} transacciones
                </p>
              </div>

              {/* Pedidos Completados */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      generalReport.completed_orders.total_orders > 0 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {generalReport.completed_orders.total_orders} pedidos
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Pedidos Completados</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(generalReport.completed_orders.total_amount)}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {formatNumber(generalReport.completed_orders.total_orders)} entregados
                </p>
              </div>

              {/* Anticipos Pendientes */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      generalReport.pending_advances.total_orders > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {generalReport.pending_advances.total_orders} pendientes
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Anticipos Pendientes</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(generalReport.pending_advances.total_advance)}
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {formatNumber(generalReport.pending_advances.total_orders)} pedidos en proceso
                </p>
              </div>

              {/* Total General */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Total consolidado
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Total General</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(generalReport.total_general)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {generalReport.total_general > 0 ? (
                    <>
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600">Ingresos totales</span>
                    </>
                  ) : (
                    <>
                      <ArrowTrendingDownIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Sin ingresos</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ingresos por Día */}
          {dailyIncome.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Ingresos por Día</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla de ingresos */}
                <div className="lg:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ingresos
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Porcentaje
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Barra
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dailyIncome.map((item) => (
                          <tr key={item.day} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="font-medium">
                                  {formatDateForDisplay(item.day)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-blue-600">
                                {formatCurrency(item.amount)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.percentage > 20 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.percentage > 10 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.percentage.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top 5 Días */}
                <div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 h-full">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5" />
                      Top 5 Días con Más Ingresos
                    </h3>
                    
                    <div className="space-y-4">
                      {getTopDays(dailyIncome, 5).map((item, index) => (
                        <div key={item.day} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formatDateForDisplay(item.day)}</p>
                              <p className="text-xs text-gray-500">{item.percentage.toFixed(2)}% del total</p>
                            </div>
                          </div>
                          <span className="font-bold text-blue-600">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Estadísticas */}
                    {dailyIncome.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-blue-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-gray-600">Días con ingresos</p>
                            <p className="text-xl font-bold text-blue-600">{dailyIncome.length}</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-sm text-gray-600">Promedio diario</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(
                                dailyIncome.reduce((sum, d) => sum + d.amount, 0) / dailyIncome.length
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen Estadístico */}
          {generalReport && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Estadísticas del Período</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ventas promedio</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(
                          generalReport.sales.total_sales > 0 
                            ? generalReport.sales.total_amount / generalReport.sales.total_sales 
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pedido promedio</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(
                          generalReport.completed_orders.total_orders > 0 
                            ? generalReport.completed_orders.total_amount / generalReport.completed_orders.total_orders 
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Anticipo promedio</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(
                          generalReport.pending_advances.total_orders > 0 
                            ? generalReport.pending_advances.total_advance / generalReport.pending_advances.total_orders 
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ingresos/día promedio</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(
                          getDaysBetween(startDate, endDate) > 0 
                            ? generalReport.total_general / getDaysBetween(startDate, endDate)
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!generalReport && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Genera tu primer reporte</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Selecciona un rango de fechas y opcionalmente una sucursal para ver un análisis detallado de ventas, pedidos e ingresos.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>El reporte se genera automáticamente para el período seleccionado</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Necesitamos importar CheckCircleIcon
import { CheckCircleIcon } from '@heroicons/react/24/outline';