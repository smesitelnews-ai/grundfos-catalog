'use client';

import React, { useState } from 'react';
import { X, Check, Package, Settings, SlidersHorizontal, Eye, Box, Tag, DollarSign, RefreshCw, Image as ImageIcon } from 'lucide-react';

export interface ExportSettings {
  vat: string;
  markup: number;
  depth: number;
  width: number;
  height: number;
  weight: number;
  guarantee: string;
  brand: string;
  country: string;
  exportDescription: boolean;
  exportImages: boolean;
  exportPrice: boolean;
  exportBarcode: boolean;
  exportSpecs: boolean;
  specsList: Record<string, boolean>;
  selectedProductIds: Set<string>;
}

interface ExportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  localProducts: any[];
  initialSettings: ExportSettings;
  onExport: (settings: ExportSettings) => void;
  isExporting: boolean;
}

export function ExportWizardModal({ isOpen, onClose, localProducts, initialSettings, onExport, isExporting }: ExportWizardModalProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<ExportSettings>(initialSettings);

  if (!isOpen) return null;

  const toggleProduct = (article: string) => {
    const newSet = new Set(settings.selectedProductIds);
    if (newSet.has(article)) newSet.delete(article);
    else newSet.add(article);
    setSettings({ ...settings, selectedProductIds: newSet });
  };

  const selectAll = () => {
    setSettings({ ...settings, selectedProductIds: new Set(localProducts.map(p => p.article)) });
  };

  const deselectAll = () => {
    setSettings({ ...settings, selectedProductIds: new Set() });
  };

  const toggleSpec = (spec: string) => {
    setSettings({
      ...settings,
      specsList: {
        ...settings.specsList,
        [spec]: !settings.specsList[spec]
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="text-blue-600" />
              Мастер выгрузки на Ozon
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Шаг {step} из 4</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 bg-white dark:bg-zinc-800 rounded-full border border-border shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 pt-4 pb-0 flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 ${step >= i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-800'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* STEP 1: PRODUCTS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Box size={20}/> Выбор товаров</h3>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-sm text-blue-600 hover:underline">Выбрать всё</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={deselectAll} className="text-sm text-red-500 hover:underline">Сбросить</button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-border p-4">
                <p className="text-sm mb-4">Выбрано товаров для выгрузки: <strong>{settings.selectedProductIds.size} из {localProducts.length}</strong></p>
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {localProducts.map(p => (
                    <label key={p.article} className={`flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-colors ${settings.selectedProductIds.has(p.article) ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white border-border dark:bg-zinc-900'}`}>
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={settings.selectedProductIds.has(p.article)} onChange={() => toggleProduct(p.article)} />
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="m-auto opacity-20 mt-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">Арт: {p.article} | Базовая цена: {p.min_price} ₽</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GLOBAL SETTINGS */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Settings size={20}/> Коммерческие и логистические настройки</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ставка НДС (VAT) *</label>
                    <select value={settings.vat} onChange={e => setSettings({...settings, vat: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="0">Не облагается</option>
                      <option value="0.1">10%</option>
                      <option value="0.2">20%</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Обязательное поле для всех товаров.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Наценка на Ozon (%)</label>
                    <div className="relative">
                      <input type="number" value={settings.markup} onChange={e => setSettings({...settings, markup: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-800 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                      <span className="absolute right-4 top-2.5 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Будет прибавлена к базовой min_price.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Бренд по умолчанию</label>
                    <input type="text" value={settings.brand} onChange={e => setSettings({...settings, brand: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Гарантия (в днях/месяцах/годах)</label>
                    <input type="text" value={settings.guarantee} onChange={e => setSettings({...settings, guarantee: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2">Габариты упаковки (По умолчанию)</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mb-4">Обязательны для FBS/FBO. Применятся, если не указаны у товара.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-orange-800 dark:text-orange-400">Длина (мм)</label>
                        <input type="number" value={settings.depth} onChange={e => setSettings({...settings, depth: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-800 border border-orange-200 rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-orange-800 dark:text-orange-400">Ширина (мм)</label>
                        <input type="number" value={settings.width} onChange={e => setSettings({...settings, width: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-800 border border-orange-200 rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-orange-800 dark:text-orange-400">Высота (мм)</label>
                        <input type="number" value={settings.height} onChange={e => setSettings({...settings, height: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-800 border border-orange-200 rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-orange-800 dark:text-orange-400">Вес брутто (г)</label>
                        <input type="number" value={settings.weight} onChange={e => setSettings({...settings, weight: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-800 border border-orange-200 rounded-lg px-3 py-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Страна изготовитель</label>
                    <input type="text" value={settings.country} onChange={e => setSettings({...settings, country: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FIELDS MAPPING */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><SlidersHorizontal size={20}/> Настройка атрибутов</h3>
              
              <div>
                <h4 className="font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Базовые поля карточки</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['exportDescription', 'exportImages', 'exportPrice', 'exportBarcode'].map(key => (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={(settings as any)[key]} onChange={(e) => setSettings({...settings, [key]: e.target.checked})} />
                      <span className="font-medium">
                        {key === 'exportDescription' ? 'Описание товара' : key === 'exportImages' ? 'Изображения' : key === 'exportPrice' ? 'Цена (с учетом наценки)' : 'Штрихкод (EAN-13)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 border-t border-border pt-6">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Свойства и Характеристики</h4>
                  <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={settings.exportSpecs} onChange={(e) => setSettings({...settings, exportSpecs: e.target.checked})} />
                    <span className="text-sm font-bold">Выгружать свойства</span>
                  </label>
                </div>
                
                {settings.exportSpecs && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-border">
                    {Object.keys(settings.specsList).map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" checked={settings.specsList[spec]} onChange={() => toggleSpec(spec)} />
                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{spec}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW AND CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Eye size={20}/> Подтверждение выгрузки</h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 text-center">
                <div className="inline-flex bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                  <RefreshCw size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">Всё готово к отправке!</h2>
                <p className="text-muted-foreground mb-6">Будет сформирован JSON-запрос и отправлен в Ozon Seller API.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Товаров</div>
                    <div className="text-xl font-bold">{settings.selectedProductIds.size} шт.</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">НДС</div>
                    <div className="text-xl font-bold">{settings.vat === '0' ? 'Без НДС' : `${Number(settings.vat)*100}%`}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Наценка</div>
                    <div className="text-xl font-bold">+{settings.markup}%</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Характеристик</div>
                    <div className="text-xl font-bold">{settings.exportSpecs ? Object.values(settings.specsList).filter(Boolean).length : 0} полей</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between bg-gray-50/50 dark:bg-zinc-900/50 rounded-b-3xl">
          <div>
            {step > 1 && (
              <button onClick={prevStep} className="px-6 py-2.5 rounded-xl font-bold border border-border hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                Назад
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold border border-border hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              Отмена
            </button>
            {step < 4 ? (
              <button onClick={nextStep} disabled={settings.selectedProductIds.size === 0} className="px-8 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Далее
              </button>
            ) : (
              <button onClick={() => onExport(settings)} disabled={isExporting || settings.selectedProductIds.size === 0} className="px-8 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 disabled:opacity-50 transition-all">
                {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                Запустить выгрузку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
