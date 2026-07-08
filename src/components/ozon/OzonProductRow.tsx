'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, Box, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface OzonProductRowProps {
  product: any;
  clientId: string;
  apiKey: string;
}

export function OzonProductRow({ product, clientId, apiKey }: OzonProductRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [attributes, setAttributes] = useState<any>(null);
  const [isLoadingAttrs, setIsLoadingAttrs] = useState(false);

  // Статусы и ошибки
  const statusName = product.statuses?.state_name || 'Неизвестно';
  const errorsArray = Array.isArray(product.errors) ? product.errors : [];
  const isError = product.statuses?.state_name?.includes('Ошиб') || errorsArray.length > 0;
  const isOk = product.statuses?.state_name?.includes('Готов') || product.statuses?.state_name?.includes('Продается') || product.statuses?.state_name?.includes('Создан');

  const statusColor = isOk
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
    : isError
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';

  // Остатки (парсим из stocks, где type: 'fbo' или 'fbs')
  const stocksArray = Array.isArray(product.stocks) ? product.stocks : [];
  const fboStock = stocksArray.find((s: any) => s.type === 'fbo')?.present || 0;
  const fbsStock = stocksArray.find((s: any) => s.type === 'fbs')?.present || 0;


  const toggleExpand = async () => {
    if (!isExpanded && !attributes) {
      setIsLoadingAttrs(true);
      try {
        const { browserOzonFetch } = await import('../../lib/ozon/ozonClient');
        const data = await browserOzonFetch<any>('/v4/product/info/attributes', {
          method: 'POST',
          clientId,
          apiKey,
          body: { filter: { product_id: [product.id] }, limit: 1 }
        });
        
        if (data && data.result && data.result.length > 0) {
          setAttributes(data.result[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingAttrs(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <tr className={`hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-zinc-800/10' : ''}`}>
        <td className="px-6 py-3">
          <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-border">
            {product.primary_image ? (
              <img src={product.primary_image} alt="pic" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-muted-foreground opacity-50" size={20} />
            )}
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="font-semibold text-foreground line-clamp-2 leading-tight">{product.name}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            <span className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold">
              Арт: {product.offer_id}
            </span>
            <span className="text-[11px]">Ozon ID: {product.id}</span>
          </div>
        </td>
        <td className="px-6 py-3 font-bold whitespace-nowrap">
          {product.price || '-'} ₽
        </td>
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-muted-foreground">FBO: <span className={fboStock > 0 ? "text-emerald-600" : "text-foreground"}>{fboStock}</span> шт.</div>
            <div className="text-xs font-semibold text-muted-foreground">FBS: <span className={fbsStock > 0 ? "text-blue-600" : "text-foreground"}>{fbsStock}</span> шт.</div>
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="flex flex-col gap-2 items-start">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${statusColor}`}>
              {statusName}
            </span>
            
            {/* Ошибки Ozon (выводим красным) */}
            {errorsArray.length > 0 && (
              <div className="flex items-start gap-1 text-red-600 dark:text-red-400 text-[11px] leading-tight max-w-[200px]">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2" title={errorsArray.map((e:any) => e?.error_reason || e?.state_name || e?.code).join(', ')}>
                  {errorsArray[0]?.error_reason || errorsArray[0]?.state_name || 'Ошибка модерации'}
                </span>
              </div>
            )}
            
            {/* Если статус "Не продается" и нет явной ошибки в массиве errors, показываем state_description */}
            {product.statuses?.state_name === 'Не продается' && errorsArray.length === 0 && (
               <div className="flex items-start gap-1 text-orange-600 dark:text-orange-400 text-[11px] leading-tight max-w-[200px]">
               <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
               <span className="line-clamp-2" title={product.statuses?.state_description}>
                 {product.statuses?.state_description || 'Не хватает данных'}
               </span>
             </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <button 
            onClick={toggleExpand}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-muted-foreground"
            title="Посмотреть характеристики"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50/80 dark:bg-zinc-900/50 p-0 border-b border-border">
            <div className="p-6 overflow-hidden">
              <h4 className="text-sm font-bold flex items-center gap-2 mb-4 text-foreground/80">
                <Box size={16} /> Детали карточки Ozon
              </h4>
              
              {isLoadingAttrs ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw size={14} className="animate-spin" /> Загрузка характеристик с Ozon API...
                </div>
              ) : attributes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Базовые данные Ozon */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider">Базовые параметры</h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">Категория (ID):</span> 
                        <span className="font-medium text-right ml-2">{attributes.category_id || '-'}</span>
                      </li>
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">Штрихкоды:</span> 
                        <span className="font-medium text-right ml-2">{attributes.barcode || '-'}</span>
                      </li>
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">Вес (объемный):</span> 
                        <span className="font-medium text-right ml-2">{product.volume_weight || '-'} кг</span>
                      </li>
                      <li className="flex justify-between border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">НДС:</span> 
                        <span className="font-medium text-right ml-2">{product.vat || '0'}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Характеристики (Attributes) */}
                  <div className="lg:col-span-2">
                    <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider flex justify-between">
                      <span>Заполненные характеристики</span>
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                        {attributes.attributes?.length || 0} полей
                      </span>
                    </h5>
                    {attributes.attributes && attributes.attributes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {attributes.attributes.slice(0, 10).map((attr: any) => (
                          <div key={attr.id} className="flex flex-col border-b border-border/50 pb-1.5">
                            <span className="text-xs text-muted-foreground">{attr.name || attr.id}</span>
                            <span className="font-medium text-[13px] truncate" title={attr.values?.map((v:any) => v.value).join(', ')}>
                              {attr.values?.map((v:any) => v.value).join(', ') || '-'}
                            </span>
                          </div>
                        ))}
                        {attributes.attributes.length > 10 && (
                          <div className="text-xs text-blue-600 font-medium pt-2">
                            + еще {attributes.attributes.length - 10} параметров скрыто
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-200 dark:border-orange-900">
                        Характеристики не заполнены или недоступны
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle size={16} /> Не удалось загрузить характеристики
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
