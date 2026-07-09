import React, { useState, useEffect } from 'react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';

interface Props {
  clientId: string;
  apiKey: string;
}

export function OzonFbsTab({ clientId, apiKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    awaiting_packaging: 0,
    awaiting_deliver: 0,
    delivering: 0,
    dispute: 0,
    delivered: 0,
    cancelled: 0,
    all: 0
  });

  const [activeTab, setActiveTab] = useState('awaiting_packaging');

  useEffect(() => {
    if (!clientId || !apiKey) return;

    const fetchFbs = async () => {
      setLoading(true);
      try {
        // Запрос к Ozon API для получения списка FBS заказов
        // Для демо: если API вернет пусто, оставим дефолтные значения как на скриншоте
        const data = await browserOzonFetch<any>('/v3/posting/fbs/unfulfilled/list', {
          clientId,
          apiKey,
          body: {
            dir: "ASC",
            filter: {
              status: ["awaiting_packaging", "awaiting_deliver"]
            },
            limit: 100,
            offset: 0
          }
        });

        if (data && data.result && data.result.postings) {
          const postings = data.result.postings;
          setCounts(prev => ({
            ...prev,
            awaiting_packaging: postings.filter((p: any) => p.status === 'awaiting_packaging').length,
            awaiting_deliver: postings.filter((p: any) => p.status === 'awaiting_deliver').length,
          }));
        }
      } catch (err: any) {
        console.error('FBS error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFbs();
  }, [clientId, apiKey]);

  if (!clientId || !apiKey) return null;

  const tabs = [
    { id: 'awaiting_packaging', label: 'Ожидают сборки', count: counts.awaiting_packaging },
    { id: 'awaiting_deliver', label: 'Ожидают отгрузки', count: counts.awaiting_deliver },
    { id: 'delivering', label: 'Доставляются', count: counts.delivering },
    { id: 'dispute', label: 'Спорные', count: counts.dispute },
    { id: 'delivered', label: 'Доставлены', count: counts.delivered },
    { id: 'cancelled', label: 'Отменены', count: counts.cancelled },
    { id: 'all', label: 'Все', count: counts.all },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm text-foreground overflow-hidden">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Заказы с моих складов</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 dark:hover:bg-zinc-800">
            Скачать <span className="text-xs">▼</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500">
            Собрать все
          </button>
        </div>
      </div>

      {/* Info Banners */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          Не получайте штрафы за опоздания
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          Ошибки в габаритах и весе товаров
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          Укажите штрихкоды товаров
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          Оцените пункт отгрузки
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count >= 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-gray-50 dark:hover:bg-zinc-800">
          Схема <span className="text-xs">▼</span>
        </button>
        <button className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-gray-50 dark:hover:bg-zinc-800">
          Склад <span className="text-xs">▼</span>
        </button>
        <button className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-gray-50 dark:hover:bg-zinc-800">
          Служба <span className="text-xs">▼</span>
        </button>
        <button className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-gray-50 dark:hover:bg-zinc-800">
          Метод <span className="text-xs">▼</span>
        </button>
        
        <div className="flex gap-2 ml-4">
          <button className="px-4 py-2 border border-blue-500 rounded-lg text-sm font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20">
            Все дни 1
          </button>
          <button className="px-4 py-2 border border-transparent text-muted-foreground hover:text-foreground text-sm font-medium">
            Сегодня 1
          </button>
          <button className="px-4 py-2 border border-transparent text-muted-foreground hover:text-foreground text-sm font-medium">
            Завтра
          </button>
          <button className="px-4 py-2 border border-transparent text-muted-foreground hover:text-foreground text-sm font-medium">
            Период <span className="text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* Empty State / Loading */}
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4 animate-pulse"></div>
        <p className="text-sm">
          {loading ? "Загрузка данных..." : "Здесь будут отображаться заказы в выбранном статусе"}
        </p>
      </div>

    </div>
  );
}
