import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { OzonProductRow } from './OzonProductRow';

interface Props {
  clientId: string;
  apiKey: string;
  products: any[];
  stats: { total: number; inSale: number; toSupply: number; errors: number; };
}

export function OzonProductsTab({ clientId, apiKey, products, stats }: Props) {
  const [activeTab, setActiveTab] = useState('all');

  if (!clientId || !apiKey) return null;

  const tabs = [
    { id: 'all', label: 'Все', count: stats.total },
    { id: 'on_sale', label: 'В продаже', count: stats.inSale },
    { id: 'ready', label: 'Готовы к продаже', count: stats.toSupply },
    { id: 'errors', label: 'Ошибки', count: stats.errors, isError: true },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-sm text-foreground overflow-hidden">
      
      {/* Tabs */}
      <div className="border-b border-border flex gap-6 px-6 pt-4 overflow-x-auto">
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
                tab.isError ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                activeTab === tab.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p>Товары не загружены.</p>
          <p className="text-sm mt-2">Используйте кнопку "Обновить данные" на главной вкладке.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-muted-foreground font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Фото</th>
                <th className="px-6 py-4 w-1/3">Название / Артикул</th>
                <th className="px-6 py-4">Цена</th>
                <th className="px-6 py-4">Остатки</th>
                <th className="px-6 py-4">Статус / Ошибки</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <OzonProductRow key={product.id || product.offer_id} product={product} clientId={clientId} apiKey={apiKey} />
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
