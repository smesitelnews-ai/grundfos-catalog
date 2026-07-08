'use client';

import React, { useState, useEffect } from 'react';
import { Key, Store, RefreshCw, LogOut, Package, Image as ImageIcon, AlertCircle } from 'lucide-react';
import productsData from '../../../public/products.json';

export default function OzonDashboard() {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ozonProducts, setOzonProducts] = useState<any[]>([]);
  const [ozonStats, setOzonStats] = useState({ total: 0, active: 0, errors: 0 });

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    exportDescription: true,
    exportImages: true,
    exportPrice: true,
    exportBarcode: true,
    exportSpecs: true,
    specsList: {
      "Максимальный расход": true,
      "Монтажная длина": true,
      "Производитель": true,
      "Гарантия": true,
      "Тип насоса": true,
      "Материал корпуса": true,
      "Рабочее давление": true,
      "Температура жидкости": true,
      "Максимальный напор": true,
      "Потребляемая мощность (P1)": true,
      "Степень защиты (IEC 34-5)": true,
      "Вес нетто": true
    } as Record<string, boolean>
  });

  const toggleSpec = (spec: string) => {
    setExportSettings(prev => ({
      ...prev,
      specsList: {
        ...prev.specsList,
        [spec]: !prev.specsList[spec]
      }
    }));
  };

  // Восстановление ключей из кэша
  useEffect(() => {
    const savedClientId = localStorage.getItem('ozon_client_id');
    const savedApiKey = localStorage.getItem('ozon_api_key');
    if (savedClientId && savedApiKey) {
      setClientId(savedClientId);
      setApiKey(savedApiKey);
      setIsAuthenticated(true);
      fetchOzonProducts(savedClientId, savedApiKey);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !apiKey) return;

    localStorage.setItem('ozon_client_id', clientId);
    localStorage.setItem('ozon_api_key', apiKey);
    setIsAuthenticated(true);
    await fetchOzonProducts(clientId, apiKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('ozon_client_id');
    localStorage.removeItem('ozon_api_key');
    setClientId('');
    setApiKey('');
    setIsAuthenticated(false);
    setOzonProducts([]);
  };

  const fetchOzonProducts = async (cId: string, aKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ozon/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: cId, apiKey: aKey })
      });
      const data = await res.json();
      if (data.success) {
        setOzonProducts(data.products || []);
        if (data.stats) {
          setOzonStats(data.stats);
        }
      } else {
        setError(data.error || 'Ошибка загрузки товаров');
        if (data.error?.includes('401') || data.error?.includes('403')) {
          handleLogout(); // Неверные ключи
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsSettingsModalOpen(false);
    setIsExporting(true);
    setExportMessage(null);
    try {
      const res = await fetch('/api/ozon/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          products: productsData, 
          vat: "0.2",
          clientId,
          apiKey,
          settings: exportSettings
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setExportMessage({ type: 'success', text: data.message });
      } else {
        setExportMessage({ type: 'error', text: data.error || 'Неизвестная ошибка' });
      }
    } catch (e) {
      console.error(e);
      setExportMessage({ type: 'error', text: 'Ошибка сети при обращении к API' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-zinc-900 border border-border shadow-xl rounded-3xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
              <Store size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center mb-2">Ozon Dashboard</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Введите ваши API ключи Ozon Seller для управления товарами.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-border rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Например: 758438"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-border rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Key size={18} />
              Войти в панель
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Store className="text-blue-600" size={32} />
            Магазин Ozon
          </h1>
          <p className="text-muted-foreground mt-1">
            Client ID: {clientId}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOzonProducts(clientId, apiKey)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-border px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 font-medium"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Обновить данные
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </div>

      {/* Main Action Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Автоматическая синхронизация</h2>
          <p className="text-blue-100 max-w-lg text-sm sm:text-base">
            Система автоматически сопоставит {productsData.length} товаров из локальной базы Grundfos с требованиями Ozon, сгенерирует штрихкоды и пропишет технические характеристики.
          </p>
        </div>
        
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          disabled={isExporting}
          className="flex-shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-black px-8 py-4 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {isExporting ? <RefreshCw className="animate-spin" size={24} /> : <Package size={24} />}
          {isExporting ? 'Выгрузка...' : 'Добавить / Обновить товары'}
        </button>
      </div>

      {exportMessage && (
        <div className={`p-4 rounded-xl mb-8 border flex items-start gap-3 ${
          exportMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-700 dark:text-red-400'
        }`}>
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold mb-1">{exportMessage.type === 'success' ? 'Успешно' : 'Ошибка'}</div>
            <div className="text-sm">{exportMessage.text}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center">
          <div className="text-4xl font-black text-blue-600">{ozonStats.total}</div>
          <div className="text-muted-foreground text-sm mt-1 font-medium">Товаров на Ozon</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center">
          <div className="text-4xl font-black text-emerald-600">{ozonStats.active}</div>
          <div className="text-muted-foreground text-sm mt-1 font-medium">В продаже</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center">
          <div className="text-4xl font-black text-orange-500">{ozonStats.errors}</div>
          <div className="text-muted-foreground text-sm mt-1 font-medium">С ошибками</div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">Карточки товаров Ozon</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center text-blue-500">
            <RefreshCw className="animate-spin" size={32} />
          </div>
        ) : ozonStats.total === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>Нет загруженных товаров на Ozon.</p>
            <p className="text-sm mt-2">Используйте кнопку сверху, чтобы загрузить каталог.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800/50 text-muted-foreground font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Фото</th>
                  <th className="px-6 py-4 w-1/2">Название / Артикул</th>
                  <th className="px-6 py-4">Цена</th>
                  <th className="px-6 py-4">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ozonProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-border">
                        {product.primary_image ? (
                          <img src={product.primary_image} alt="pic" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-muted-foreground opacity-50" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-foreground line-clamp-2">{product.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">Арт: {product.offer_id}</div>
                    </td>
                    <td className="px-6 py-3 font-semibold whitespace-nowrap">
                      {product.price || '-'} ₽
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block whitespace-nowrap ${
                        product.status?.state_name?.includes('Готов') || product.status?.state_name?.includes('Продается')
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : product.status?.state_name?.includes('Ошиб')
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {product.status?.state_name || 'Неизвестно'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">Настройки выгрузки на Ozon</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <LogOut size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-6">
                
                {/* Basic Fields */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Базовые поля</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={exportSettings.exportDescription} onChange={(e) => setExportSettings(s => ({...s, exportDescription: e.target.checked}))} />
                      <span className="font-medium">Описание товара</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={exportSettings.exportImages} onChange={(e) => setExportSettings(s => ({...s, exportImages: e.target.checked}))} />
                      <span className="font-medium">Изображения</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={exportSettings.exportPrice} onChange={(e) => setExportSettings(s => ({...s, exportPrice: e.target.checked}))} />
                      <span className="font-medium">Цена (min_price)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={exportSettings.exportBarcode} onChange={(e) => setExportSettings(s => ({...s, exportBarcode: e.target.checked}))} />
                      <span className="font-medium">Штрихкод (EAN-13)</span>
                    </label>
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Характеристики</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={exportSettings.exportSpecs} onChange={(e) => setExportSettings(s => ({...s, exportSpecs: e.target.checked}))} />
                      <span className="text-sm font-medium">Выгружать характеристики</span>
                    </label>
                  </div>
                  
                  {exportSettings.exportSpecs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-border">
                      {Object.keys(exportSettings.specsList).map((spec) => (
                        <label key={spec} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" 
                            checked={exportSettings.specsList[spec]} 
                            onChange={() => toggleSpec(spec)} 
                          />
                          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{spec}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50 rounded-b-3xl">
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold border border-border hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={handleExport}
                className="px-8 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-2 transition-all"
              >
                <RefreshCw size={18} />
                Начать выгрузку
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
