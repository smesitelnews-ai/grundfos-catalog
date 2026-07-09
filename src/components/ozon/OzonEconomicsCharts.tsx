'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, ComposedChart
} from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw, DollarSign, Activity, Eye, ShoppingCart } from 'lucide-react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';

interface OzonEconomicsChartsProps {
  clientId: string;
  apiKey: string;
}

export function OzonEconomicsCharts({ clientId, apiKey }: OzonEconomicsChartsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    profit: 0,
    views: 0,
    conversion: 0
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Generate dates for the last 14 days
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 14);

      const formatIsoDate = (d: Date) => d.toISOString();
      const formatApiDate = (d: Date) => d.toISOString().split('T')[0];

      // Array of last 14 days for building the chart base
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(dateFrom);
        d.setDate(d.getDate() + i + 1);
        return formatApiDate(d);
      });

      let finalChartData = days.map(day => ({
        date: day,
        revenue: 0,
        profit: 0,
        views: 0,
        orders: 0
      }));

      let totalRevenue = 0;
      let totalViews = 0;
      let totalOrders = 0;

      // 2. Fetch Accruals (v1/finance/accrual/by-day)
      // Note: If this fails, we will catch it and show 0.
      try {
        const promises = days.map(day => 
           browserOzonFetch<any>('/v1/finance/accrual/by-day', {
             clientId, apiKey, method: 'POST',
             body: { date: day }
           }).catch(() => null)
        );
        
        const responses = await Promise.all(promises);
        
        responses.forEach((accrualsResponse, i) => {
          if (accrualsResponse && accrualsResponse.result && Array.isArray(accrualsResponse.result)) {
             const day = days[i];
             const dayIndex = finalChartData.findIndex(d => d.date === day);
             if (dayIndex !== -1) {
                accrualsResponse.result.forEach((accrual: any) => {
                   finalChartData[dayIndex].revenue += accrual.revenue || 0;
                   finalChartData[dayIndex].profit += accrual.profit || 0;
                   totalRevenue += accrual.revenue || 0;
                });
             }
          }
        });
      } catch (err: any) {
        console.warn('Ozon Accruals API error or not available:', err.message);
      }

      // 3. Fetch Analytics (v1/analytics/data)
      try {
        const analyticsResponse = await browserOzonFetch<any>('/v1/analytics/data', {
          clientId, apiKey, method: 'POST',
          body: {
            date_from: formatApiDate(dateFrom),
            date_to: formatApiDate(dateTo),
            metrics: ["revenue", "ordered_units", "hits_view", "conv_tocart_search"],
            dimension: ["day"],
            filters: [],
            sort: [],
            limit: 1000,
            offset: 0
          }
        });

        if (analyticsResponse && analyticsResponse.result && analyticsResponse.result.data) {
          analyticsResponse.result.data.forEach((row: any) => {
             const day = row.dimensions?.[0]?.id; // usually date is the dimension
             const metricsVals = row.metrics || [];
             const dayIndex = finalChartData.findIndex(d => d.date === day);
             if (dayIndex !== -1 && metricsVals.length >= 3) {
                // revenue, ordered_units, hits_view
                finalChartData[dayIndex].revenue = finalChartData[dayIndex].revenue || metricsVals[0];
                finalChartData[dayIndex].orders = metricsVals[1];
                finalChartData[dayIndex].views = metricsVals[2];
                totalViews += metricsVals[2];
                totalOrders += metricsVals[1];
             }
          });
        }
      } catch (err: any) {
         console.warn('Ozon Analytics API error:', err.message);
      }

      // If data is completely empty (e.g. test account without actual sales), we can populate mock data just to show the dashboard capabilities
      const hasRealData = finalChartData.some(d => d.revenue > 0 || d.views > 0);
      
      if (!hasRealData) {
        console.log("No real data found, showing zeros");
      }

      setChartData(finalChartData);
      setMetrics({
        revenue: totalRevenue,
        profit: totalRevenue * 0.25, // Mock profit calculation if API doesn't provide exact 'profit' field
        views: totalViews,
        conversion: totalViews > 0 ? Number(((totalOrders / totalViews) * 100).toFixed(2)) : 0
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка загрузки аналитики');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, apiKey]);

  return (
    <div className="space-y-6 mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600">
             <DollarSign size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Выручка (14 дней)</div>
            <div className="text-2xl font-black">{metrics.revenue.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600">
             <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Прибыль (~25%)</div>
            <div className="text-2xl font-black text-emerald-600">{metrics.profit.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600">
             <Eye size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Просмотры</div>
            <div className="text-2xl font-black">{metrics.views.toLocaleString('ru-RU')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600">
             <Activity size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Конверсия в заказ</div>
            <div className="text-2xl font-black">{metrics.conversion}%</div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
           <AlertCircle size={18} />
           {error}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue & Profit Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Выручка и Прибыль</h3>
              <button onClick={fetchData} disabled={isLoading} className="text-muted-foreground hover:text-blue-600 transition-colors">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </button>
           </div>
           
           {isLoading ? (
             <div className="h-64 flex items-center justify-center text-muted-foreground">Загрузка данных...</div>
           ) : (
             <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value} ₽`, '']}
                      labelFormatter={(label) => `Дата: ${label}`}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" name="Выручка" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" name="Прибыль" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           )}
        </div>

        {/* Funnel/Views Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Воронка: Просмотры и Заказы</h3>
           </div>
           
           {isLoading ? (
             <div className="h-64 flex items-center justify-center text-muted-foreground">Загрузка данных...</div>
           ) : (
             <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar yAxisId="left" name="Просмотры" dataKey="views" barSize={20} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" name="Заказы" dataKey="orders" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
