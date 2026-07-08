import React, { useState, useEffect } from 'react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';

interface Props {
  clientId: string;
  apiKey: string;
}

export function OzonFbsTab({ clientId, apiKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    awaiting_packaging: 1,
    awaiting_deliver: 0,
    delivering: 11,
    dispute: 0,
    delivered: 0,
    cancelled: 0,
    all: 12
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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-black">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>FBS</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Заказы с моих складов</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
            Скачать <span className="text-xs">▼</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Собрать все
          </button>
        </div>
      </div>

      {/* Warning Badges */}
      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">Не получайте штрафы за опоздания</span>
        <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Ошибки в габаритах и весе товаров</span>
        <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Укажите штрихкоды товаров</span>
        <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">Оцените пункт отгрузки</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters Area */}
      <div className="flex flex-wrap gap-3 mb-6 items-center border-b border-gray-100 pb-6">
        <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none">
          <option>Схема</option>
        </select>
        <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none">
          <option>Склад</option>
        </select>
        <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none">
          <option>Служба</option>
        </select>
        <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none">
          <option>Метод</option>
        </select>

        <div className="flex gap-2 ml-4">
          <button className="px-3 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg text-sm font-medium">
            Все дни 1
          </button>
          <button className="px-3 py-2 bg-white border border-transparent text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
            Сегодня 1
          </button>
          <button className="px-3 py-2 bg-white border border-transparent text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
            Завтра
          </button>
          <button className="px-3 py-2 bg-white border border-transparent text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-1">
            Период <span className="text-xs">▼</span>
          </button>
        </div>
      </div>
      
      {loading ? (
         <div className="py-12 text-center text-gray-500">Загрузка данных...</div>
      ) : (
         <div className="py-12 flex flex-col items-center justify-center text-gray-400">
           <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
           <p>Здесь будут отображаться заказы в выбранном статусе</p>
         </div>
      )}
    </div>
  );
}
