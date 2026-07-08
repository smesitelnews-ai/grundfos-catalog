'use client';

import React, { useState } from 'react';
import { RefreshCw, Check, X, AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';

interface OzonPricesTabProps {
  products: any[];
  clientId: string;
  apiKey: string;
  onRefresh: () => void;
}

export function OzonPricesTab({ products, clientId, apiKey, onRefresh }: OzonPricesTabProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pricesState, setPricesState] = useState<Record<number, { price: string, old_price: string }>>({});

  const handlePriceChange = (id: number, field: 'price' | 'old_price', value: string) => {
    setPricesState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getInitialPrice = (product: any, field: 'price' | 'old_price') => {
    return pricesState[product.id]?.[field] ?? product[field] ?? '';
  };

  const handleSavePrice = async (product: any) => {
    const state = pricesState[product.id];
    if (!state) return;

    setUpdatingId(product.id);
    try {
      const response = await browserOzonFetch<any>('/v1/product/import/prices', {
        method: 'POST',
        clientId,
        apiKey,
        body: {
          prices: [
            {
              offer_id: product.offer_id,
              product_id: product.id,
              price: state.price,
              old_price: state.old_price,
              currency_code: product.currency_code || "RUB"
            }
          ]
        }
      });
      if (response && response.result) {
        // Успешно отправлено
        setTimeout(() => {
          onRefresh(); // Обновляем данные с сервера Ozon
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при обновлении цены: ' + (e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderPriceIndex = (indexData: any) => {
    if (!indexData || !indexData.color_index || indexData.color_index === 'WITHOUT_INDEX') {
      return (
        <div className="flex items-center gap-1 text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-xs font-semibold">
          <Minus size={14} /> Нет данных
        </div>
      );
    }

    const color = indexData.color_index;
    let badgeClass = '';
    let icon = null;
    let label = '';
    let description = '';

    const ozonIndex = indexData.ozon_index_data?.price_index_value;
    const minPrice = indexData.ozon_index_data?.minimal_price;

    if (color === 'COLOR_INDEX_GREEN') {
      badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      icon = <TrendingDown size={14} />;
      label = 'Выгодная';
    } else if (color === 'COLOR_INDEX_YELLOW') {
      badgeClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      icon = <Check size={14} />;
      label = 'Оптимальная';
    } else if (color === 'COLOR_INDEX_RED') {
      badgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      icon = <TrendingUp size={14} />;
      label = 'Завышена';
      description = `Рынок: от ${minPrice} ₽`;
    }

    return (
      <div className="flex flex-col gap-1 items-start">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold ${badgeClass}`}>
          {icon}
          {label}
        </div>
        {description && <div className="text-[10px] text-muted-foreground font-medium">{description}</div>}
        {ozonIndex > 0 && <div className="text-[10px] text-muted-foreground">Индекс: {ozonIndex}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold">Управление ценами</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Контролируйте конкурентоспособность ваших цен. Ozon обновляет индекс цен каждые несколько часов.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/50 text-muted-foreground font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Артикул / Название</th>
              <th className="px-6 py-4">Цена до скидки (₽)</th>
              <th className="px-6 py-4">Цена Ozon (₽)</th>
              <th className="px-6 py-4">Индекс цен</th>
              <th className="px-6 py-4 w-32">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const currentPrice = getInitialPrice(product, 'price');
              const currentOldPrice = getInitialPrice(product, 'old_price');
              const isChanged = currentPrice !== product.price || currentOldPrice !== product.old_price;
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium max-w-[250px] truncate" title={product.name}>{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Арт: {product.offer_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={currentOldPrice}
                      onChange={e => handlePriceChange(product.id, 'old_price', e.target.value)}
                      className="w-24 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2 py-1.5 focus:border-blue-500 outline-none text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={currentPrice}
                      onChange={e => handlePriceChange(product.id, 'price', e.target.value)}
                      className="w-24 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2 py-1.5 focus:border-blue-500 outline-none font-bold text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {renderPriceIndex(product.price_indexes)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSavePrice(product)}
                      disabled={!isChanged || updatingId === product.id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        isChanged 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {updatingId === product.id ? <RefreshCw size={14} className="animate-spin" /> : 'Сохранить'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
