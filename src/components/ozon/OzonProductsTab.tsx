import React, { useState } from 'react';

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
    { id: 'in_work', label: 'На доработку', count: 0, isWarning: true },
    { id: 'removed', label: 'Сняты с продажи', count: 0 },
    { id: 'archive', label: 'Архив', count: 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-black">
      
      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count >= 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                tab.isError ? 'bg-red-500 text-white' :
                tab.isWarning ? 'bg-orange-400 text-white' :
                'bg-gray-100 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            placeholder="Название, артикул, SKU, штрихкод"
          />
        </div>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50">
          Фильтры <span className="text-xs text-gray-400">▼</span>
        </button>
      </div>

      {/* Table Mockup */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Артикул <span className="text-xs">▼</span></th>
              <th className="px-4 py-3 border-l border-gray-200">Название товара <span className="text-xs">▼</span></th>
              <th className="px-4 py-3 text-blue-600">Дата создания <span className="text-xs">↓ ▼</span></th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Мои склады <span className="text-xs">▼</span></th>
              <th className="px-4 py-3">Метки <span className="text-xs">▼</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id || product.offer_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">{product.offer_id}</td>
                <td className="px-4 py-4 border-l border-gray-200 truncate max-w-xs" title={product.name}>
                  {product.name}
                </td>
                <td className="px-4 py-4">{product.created_at ? new Date(product.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${product.status?.state_name === 'Продается' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {product.status?.state_name || product.status?.validation_state || 'Не продается'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right pr-8">{product.stocks?.present || 0}</td>
                <td className="px-4 py-4">
                  <button className="text-blue-600 font-medium">Добавить</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                 <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Товары не найдены (нажмите "Обновить данные" на главной вкладке)
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
