'use client';

import React, { useState, useEffect } from 'react';
import { Store, Key, Package, Settings, RefreshCw, LogOut, AlertCircle, BarChart2, DollarSign, Warehouse } from 'lucide-react';
import productsData from '../../../public/products.json';
import { ExportWizardModal, ExportSettings } from '../../components/ozon/ExportWizardModal';
import { OzonProductRow } from '../../components/ozon/OzonProductRow';
import { OzonPricesTab } from '../../components/ozon/OzonPricesTab';
import { OzonStocksTab } from '../../components/ozon/OzonStocksTab';
import { OzonEconomicsCharts } from '../../components/ozon/OzonEconomicsCharts';
import { OzonProductsTab } from '../../components/ozon/OzonProductsTab';
import { OzonFinanceTab } from '../../components/ozon/OzonFinanceTab';
import { OzonFbsTab } from '../../components/ozon/OzonFbsTab';
export default function OzonDashboard() {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'finance' | 'fbs' | 'prices' | 'stocks'>('overview');
  
  const [ozonProducts, setOzonProducts] = useState<any[]>([]);
  const [ozonStats, setOzonStats] = useState({ total: 0, inSale: 0, toSupply: 0, errors: 0 });

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    vat: "0.2",
    markup: 0,
    depth: 300,
    width: 200,
    height: 150,
    weight: 2500,
    guarantee: "1 год",
    brand: "Grundfos",
    country: "Дания",
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
    },
    selectedProductIds: new Set(productsData.map(p => p.article))
  });

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
      const { browserOzonFetch } = await import('../../lib/ozon/ozonClient');
      
      const getCount = async (visibility: string) => {
        try {
          const res = await browserOzonFetch<any>('/v3/product/list', {
            method: 'POST', clientId: cId, apiKey: aKey,
            body: { filter: { visibility }, limit: 1 }
          });
          return res?.result?.total || 0;
        } catch {
          return 0;
        }
      };

      const [total, inSale, toSupply, errorsCount] = await Promise.all([
        getCount("ALL"),
        getCount("IN_SALE"),
        getCount("TO_SUPPLY"),
        getCount("VALIDATION_STATE_FAIL")
      ]);

      const listResponse = await browserOzonFetch<any>('/v3/product/list', {
        method: 'POST', clientId: cId, apiKey: aKey,
        body: { filter: { visibility: "ALL" }, limit: 50 }
      });

      const items = listResponse?.result?.items || [];
      const productIds = items.map((i: any) => i.product_id);

      let allProducts: any[] = [];
      if (productIds.length > 0) {
        try {
          const infoResponse = await browserOzonFetch<any>('/v3/product/info/list', {
            method: 'POST', clientId: cId, apiKey: aKey,
            body: { product_id: productIds, offer_id: [], sku: [] }
          });
          allProducts = infoResponse?.items || infoResponse?.result?.items || [];
        } catch (error) {
          console.error(`[Ozon] Ошибка при загрузке деталей товаров:`, error);
        }
      }

      setOzonProducts(allProducts);
      setOzonStats({ total, inSale, toSupply, errors: errorsCount });
    } catch (error: any) {
      console.error("[Ozon fetch error]", error);
      setError(error.message || "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (finalSettings: ExportSettings) => {
    setIsSettingsModalOpen(false);
    setIsExporting(true);
    setExportMessage(null);
    setExportSettings(finalSettings); // Сохраняем последние настройки
    
    // Фильтруем товары, чтобы отправить только выбранные
    const productsToExport = productsData.filter(p => finalSettings.selectedProductIds.has(p.article));

    try {
      const { browserOzonFetch } = await import('../../lib/ozon/ozonClient');
      const { mapProductToOzonAttributes, generateEan13 } = await import('../../lib/ozon/attributeMapper');
      
      const items = productsToExport.map((product: any) => {
        let typeId = 98340;
        let ozonCategoryName = "Насос поверхностный";
        const pumpType = product.specs?.["Тип насоса"]?.toLowerCase() || "";
        if (pumpType.includes("погружной") || pumpType.includes("дренажный") || pumpType.includes("скважинный")) {
          typeId = 91462;
          ozonCategoryName = "Насос погружной";
        } else if (pumpType.includes("станция")) {
          typeId = 91468;
          ozonCategoryName = "Насосная станция";
        }

        const depth = finalSettings.depth || 300;
        const width = finalSettings.width || 200;
        const height = finalSettings.height || 150;
        const weight = finalSettings.weight || 2500;

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grundfos-catalog-demo.vercel.app";
        const primaryImage = product.image ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : undefined;

        const item: any = {
          description_category_id: 83625738,
          name: `Насос ${product.name}`,
          offer_id: product.article,
          vat: finalSettings.vat,
          currency_code: "RUB",
          depth, width, height,
          dimension_unit: "mm",
          weight, weight_unit: "g",
          attributes: mapProductToOzonAttributes(product, ozonCategoryName, finalSettings),
          complex_attributes: []
        };

        if (finalSettings.exportPrice) {
          const basePrice = product.our_price || product.min_price || 10000;
          const markupPercent = Number(finalSettings.markup) || 0;
          const finalPrice = Math.round(basePrice * (1 + markupPercent / 100));
          item.price = String(finalPrice);
        } else {
          item.price = "0";
        }

        if (finalSettings.exportBarcode) {
          item.barcode = product.barcode || generateEan13(product.article);
        }

        if (finalSettings.exportImages && primaryImage) {
          item.primary_image = primaryImage;
          item.images = [primaryImage];
        } else {
          item.primary_image = "";
          item.images = [];
        }

        return item;
      });

      console.log(`[Browser Ozon Export] Отправка ${items.length} товаров на Ozon...`);
      const response = await browserOzonFetch<any>('/v3/product/import', {
        method: 'POST',
        body: { items },
        clientId,
        apiKey
      });

      if (response && response.result) {
        setExportMessage({ type: 'success', text: `Задание на импорт успешно создано. Task ID: ${response.result.task_id}` });
        // После выгрузки обновляем статистику на дашборде
        await fetchOzonProducts(clientId, apiKey);
      } else {
        setExportMessage({ type: 'error', text: 'Ошибка: Не получен ответ от Ozon API' });
      }
    } catch (e: any) {
      console.error(e);
      setExportMessage({ type: 'error', text: e.message || 'Ошибка сети при обращении к API' });
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

      {/* Tabs Menu */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'overview', icon: BarChart2, label: 'Сводка' },
          { id: 'products', icon: Package, label: 'Товары' },
          { id: 'finance', icon: DollarSign, label: 'Финансы' },
          { id: 'fbs', icon: Warehouse, label: 'FBS' },
          { id: 'prices', icon: DollarSign, label: 'Управление ценами' },
          { id: 'stocks', icon: Warehouse, label: 'Склады FBS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-800 border border-border'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <div className="text-3xl sm:text-4xl font-black text-blue-600">{ozonStats.total}</div>
              <div className="text-muted-foreground text-xs sm:text-sm mt-1 font-medium">Всего на Ozon</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">{ozonStats.inSale}</div>
              <div className="text-muted-foreground text-xs sm:text-sm mt-1 font-medium">В продаже</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-500">{ozonStats.toSupply}</div>
              <div className="text-muted-foreground text-xs sm:text-sm mt-1 font-medium">Готовы к продаже</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <div className="text-3xl sm:text-4xl font-black text-orange-500">{ozonStats.errors}</div>
              <div className="text-muted-foreground text-xs sm:text-sm mt-1 font-medium">С ошибками</div>
            </div>
          </div>

          {/* Economics Dashboard */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Экономика магазина (Аналитика Ozon)</h2>
            <OzonEconomicsCharts clientId={clientId} apiKey={apiKey} />
          </div>
        </>
      )}

      {/* Product List UI Replica */}
      {activeTab === 'products' && (
        <OzonProductsTab clientId={clientId} apiKey={apiKey} products={ozonProducts} stats={ozonStats} />
      )}

      {/* Finance UI Replica */}
      {activeTab === 'finance' && (
        <OzonFinanceTab clientId={clientId} apiKey={apiKey} />
      )}

      {/* FBS UI Replica */}
      {activeTab === 'fbs' && (
        <OzonFbsTab clientId={clientId} apiKey={apiKey} />
      )}

      {activeTab === 'prices' && (
        <OzonPricesTab 
          products={ozonProducts} 
          clientId={clientId} 
          apiKey={apiKey} 
          onRefresh={() => fetchOzonProducts(clientId, apiKey)} 
        />
      )}

      {activeTab === 'stocks' && (
        <OzonStocksTab 
          products={ozonProducts} 
          clientId={clientId} 
          apiKey={apiKey} 
          onRefresh={() => fetchOzonProducts(clientId, apiKey)} 
        />
      )}

      {/* Settings Modal */}
      <ExportWizardModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        localProducts={productsData}
        initialSettings={exportSettings}
        onExport={handleExport}
        isExporting={isExporting}
      />

    </div>
  );
}
