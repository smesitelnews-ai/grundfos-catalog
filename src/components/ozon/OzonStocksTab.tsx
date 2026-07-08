'use client';

import React, { useState } from 'react';
import { RefreshCw, Package, Warehouse } from 'lucide-react';
import { browserOzonFetch } from '../../lib/ozon/ozonClient';

interface OzonStocksTabProps {
  products: any[];
  clientId: string;
  apiKey: string;
  onRefresh: () => void;
}

export function OzonStocksTab({ products, clientId, apiKey, onRefresh }: OzonStocksTabProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [stocksState, setStocksState] = useState<Record<number, string>>({});

  const getFboStock = (product: any) => {
    const arr = Array.isArray(product.stocks) ? product.stocks : (product.stocks?.stocks || []);
    return arr.find((s: any) => s.type === 'fbo')?.present || 0;
  };

  const getFbsStock = (product: any) => {
    const arr = Array.isArray(product.stocks) ? product.stocks : (product.stocks?.stocks || []);
    return arr.find((s: any) => s.type === 'fbs')?.present || 0;
  };

  const handleStockChange = (id: number, value: string) => {
    setStocksState(prev => ({ ...prev, [id]: value }));
  };

  const getCurrentFbsStock = (product: any) => {
    return stocksState[product.id] ?? String(getFbsStock(product));
  };

  const handleSaveStock = async (product: any) => {
    const newValue = stocksState[product.id];
    if (newValue === undefined) return;

    setUpdatingId(product.id);
    try {
      const response = await browserOzonFetch<any>('/v2/products/stocks', {
        method: 'POST',
        clientId,
        apiKey,
        body: {
          stocks: [
            {
              offer_id: product.offer_id,
              product_id: product.id,
              stock: parseInt(newValue, 10) || 0
            }
          ]
        }
      });
      if (response && response.result) {
        // Успешно
        setTimeout(() => {
          onRefresh();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при обновлении остатков: ' + (e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Warehouse size={20} className="text-blue-600" />
          Управление остатками (Склады FBS)
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Здесь вы можете редактировать количество товаров на вашем складе (FBS). Остатки FBO (на складах Ozon) обновляются автоматически.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/50 text-muted-foreground font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Артикул / Название</th>
              <th className="px-6 py-4 text-center">На складе Ozon (FBO)</th>
              <th className="px-6 py-4">На вашем складе (FBS)</th>
              <th className="px-6 py-4 w-32">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const currentFbsStr = getCurrentFbsStock(product);
              const originalFbs = String(getFbsStock(product));
              const isChanged = currentFbsStr !== originalFbs;
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium max-w-[250px] truncate" title={product.name}>{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Арт: {product.offer_id}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg font-bold">
                      <Package size={14} />
                      {getFboStock(product)} шт.
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        value={currentFbsStr}
                        onChange={e => handleStockChange(product.id, e.target.value)}
                        className="w-24 bg-white dark:bg-zinc-900 border border-border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                      />
                      <span className="text-muted-foreground">шт.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSaveStock(product)}
                      disabled={!isChanged || updatingId === product.id}
                      className={`flex items-center justify-center w-full gap-1 px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                        isChanged 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-muted-foreground opacity-50 cursor-not-allowed border border-transparent dark:border-border'
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
