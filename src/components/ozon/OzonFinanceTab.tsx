import React, { useState, useEffect } from 'react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';
import { DollarSign, AlertCircle, RefreshCw, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

interface Props {
  clientId: string;
  apiKey: string;
}

export function OzonFinanceTab({ clientId, apiKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [financeData, setFinanceData] = useState<{
    accruals_for_sale: number;
    refunds_and_cancellations: number;
    services_amount: number;
    compensation_amount: number;
    money_transfer: number;
    others_amount: number;
  } | null>(null);

  const fetchFinance = async () => {
    if (!clientId || !apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().split('T')[0];

      const data = await browserOzonFetch<any>('/v1/finance/accrual/by-day', {
        method: 'POST',
        clientId,
        apiKey,
        body: {
          filter: {
            date: { from: firstDay, to: lastDay }
          }
        }
      });

      if (data && data.result) {
        let totalRevenue = 0;
        let totalProfit = 0;
        
        data.result.forEach((dayData: any) => {
           totalRevenue += dayData.revenue || 0;
           totalProfit += dayData.profit || 0;
        });

        // Поскольку Ozon убрал детализацию по услугам в агрегированном v1 методе,
        // мы считаем начисления как общую выручку (revenue), а списания как разницу между выручкой и профитом.
        setFinanceData({
          accruals_for_sale: totalRevenue,
          refunds_and_cancellations: 0,
          services_amount: totalRevenue - totalProfit,
          compensation_amount: 0,
          money_transfer: 0,
          others_amount: 0,
        });
      } else {
        throw new Error("Не удалось получить данные о финансах (Пустой ответ API)");
      }
    } catch (err: any) {
      console.error('Finance error:', err);
      setError(err.message || 'Ошибка загрузки финансов (Возможно нет прав на API аналитики)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [clientId, apiKey]);

  if (!clientId || !apiKey) return null;

  const currentMonthName = new Date().toLocaleString('ru-RU', { month: 'long' });
  const totalForMonth = financeData 
    ? (financeData.accruals_for_sale - financeData.services_amount)
    : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm text-foreground">
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>Финансы</span>
        <span>›</span>
        <span>Начисления и документы</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Баланс</h2>
        <div className="flex gap-4">
          <button 
            onClick={fetchFinance}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Обновить
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Пополнить основной баланс
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && !financeData ? (
        <div className="py-12 flex justify-center text-muted-foreground">
          <div className="animate-pulse flex items-center gap-2">
            <RefreshCw className="animate-spin" /> Загрузка данных из Ozon...
          </div>
        </div>
      ) : financeData ? (
        <>
          {/* Debt Warning */}
          {totalForMonth < 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl mb-8">
              <h3 className="font-bold text-lg mb-2 text-red-700 dark:text-red-400">У вас есть задолженность {Math.abs(totalForMonth).toLocaleString('ru-RU')} ₽</h3>
              <p className="text-sm mb-4 text-red-900/70 dark:text-red-300">
                Приостановили доступ к некоторым услугам. Пополните баланс, чтобы не оставаться в минусе.
              </p>
              <p className="text-sm text-red-900/60 dark:text-red-300/70 mb-4">
                Формируем счет на оплату, только если зафиксировали задолженность за предыдущий месяц.<br/>
                Посмотреть счета можно в разделе Финансы → Документы → Счета на оплату
              </p>
              <div className="flex gap-6 text-sm font-medium">
                <a href="#" className="text-foreground hover:underline">Подробнее в Базе знаний</a>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Посмотреть счета</a>
              </div>
            </div>
          )}

          {/* Balance Details */}
          <div className="flex flex-col md:flex-row gap-8 border-t border-border pt-8">
            <div className="w-64">
              <div className="text-4xl font-bold mb-1">{totalForMonth.toLocaleString('ru-RU')} ₽</div>
              <div className="text-sm text-muted-foreground">Текущий баланс</div>
              <div className="text-xs text-muted-foreground mt-1 opacity-60">(Расчет за текущий месяц)</div>
            </div>

            <div className="flex-1 max-w-sm space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">На начало месяца</span>
                <span className="font-medium text-muted-foreground">Недоступно в API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Начислено в {currentMonthName}</span>
                <span className="font-medium">{financeData.accruals_for_sale.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Списано в {currentMonthName}</span>
                <span className="font-medium">{financeData.services_amount.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
