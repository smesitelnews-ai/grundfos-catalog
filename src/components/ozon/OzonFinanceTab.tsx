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
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const data = await browserOzonFetch<any>('/v3/finance/transaction/totals', {
        method: 'POST',
        clientId,
        apiKey,
        body: {
          date: { from: firstDay, to: lastDay },
          posting_number: "",
          transaction_type: "all"
        }
      });

      if (data && data.result) {
        setFinanceData({
          accruals_for_sale: data.result.accruals_for_sale || 0,
          refunds_and_cancellations: data.result.refunds_and_cancellations || 0,
          services_amount: data.result.services_amount || 0,
          compensation_amount: data.result.compensation_amount || 0,
          money_transfer: data.result.money_transfer || 0,
          others_amount: data.result.others_amount || 0,
        });
      } else {
        throw new Error("Не удалось получить данные о финансах");
      }
    } catch (err: any) {
      console.error('Finance error:', err);
      setError(err.message || 'Ошибка загрузки финансов');
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
    ? (financeData.accruals_for_sale + financeData.refunds_and_cancellations + financeData.services_amount + financeData.compensation_amount + financeData.others_amount + financeData.money_transfer)
    : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm text-foreground">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="text-blue-500" /> Финансы (за {currentMonthName})
        </h2>
        <button 
          onClick={fetchFinance}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium border border-border rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Обновить
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Balance Card */}
            <div className="bg-gray-50 dark:bg-zinc-800/80 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <CreditCard size={18} />
                <span className="text-sm font-medium">Итого за текущий месяц</span>
              </div>
              <div className={`text-4xl font-black mb-4 ${totalForMonth < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {totalForMonth.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-500">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">Начисления за продажи</span>
              </div>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {financeData.accruals_for_sale.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-500">
                <TrendingDown size={18} />
                <span className="text-sm font-medium">Услуги, возвраты и прочее</span>
              </div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {(financeData.services_amount + financeData.refunds_and_cancellations + financeData.others_amount).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border font-bold">Детализация за месяц</div>
            <div className="divide-y divide-border">
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Продажи</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{financeData.accruals_for_sale.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Возвраты и отмены</span>
                <span className="font-medium text-red-500 dark:text-red-400">{financeData.refunds_and_cancellations.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Услуги доставки и Ozon</span>
                <span className="font-medium text-red-500 dark:text-red-400">{financeData.services_amount.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Компенсации</span>
                <span className="font-medium">{financeData.compensation_amount.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Переводы денег</span>
                <span className="font-medium">{financeData.money_transfer.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-muted-foreground">Прочие начисления/списания</span>
                <span className="font-medium">{financeData.others_amount.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
