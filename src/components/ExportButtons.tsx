'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, Store, X } from 'lucide-react';
import { exportToExcel } from '@/lib/exportExcel';
import { pdf } from '@react-pdf/renderer';
import { CatalogPdf } from './pdf/CatalogPdf';

interface ExportButtonsProps {
  products: any[];
  isSingle?: boolean;
}

export default function ExportButtons({ products, isSingle = false }: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Ozon State
  const [isExportingOzon, setIsExportingOzon] = useState(false);
  const [showOzonModal, setShowOzonModal] = useState(false);
  const [ozonVat, setOzonVat] = useState("0.2"); // Default 20%
  const [ozonResult, setOzonResult] = useState<{success: boolean, message: string} | null>(null);

  const handleExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportToExcel(products, isSingle);
    } catch (e) {
      console.error(e);
      alert('Ошибка при экспорте в Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePdf = async () => {
    setIsExportingPdf(true);
    try {
      const doc = <CatalogPdf products={products} isSingle={isSingle} />;
      const asPdf = pdf(doc); 
      const blob = await asPdf.toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = isSingle ? `КП_${products[0].article}.pdf` : 'Каталог_Grundfos.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Ошибка при экспорте в PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOzonExport = async () => {
    setIsExportingOzon(true);
    setOzonResult(null);
    try {
      const res = await fetch('/api/ozon/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, vat: ozonVat })
      });
      const data = await res.json();
      
      if (data.success) {
        setOzonResult({ success: true, message: data.message });
      } else {
        setOzonResult({ success: false, message: data.error || 'Неизвестная ошибка' });
      }
    } catch (e) {
      console.error(e);
      setOzonResult({ success: false, message: 'Ошибка сети при обращении к API' });
    } finally {
      setIsExportingOzon(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-6">
        <button 
          onClick={handleExcel} 
          disabled={isExportingExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md"
        >
          {isExportingExcel ? <Loader2 className="animate-spin" size={20} /> : <FileSpreadsheet size={20} />}
          Скачать {isSingle ? 'Excel' : 'Прайс-лист (Excel)'}
        </button>

        <button 
          onClick={handlePdf}
          disabled={isExportingPdf}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md"
        >
          {isExportingPdf ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
          Скачать {isSingle ? 'КП (PDF)' : 'Каталог (PDF)'}
        </button>

        <button 
          onClick={() => setShowOzonModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          <Store size={20} />
          Выгрузить на Ozon
        </button>
      </div>

      {showOzonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setShowOzonModal(false); setOzonResult(null); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <Store className="text-blue-500" /> Выгрузка на Ozon
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Вы собираетесь выгрузить {isSingle ? '1 товар' : `${products.length} товаров`} на маркетплейс Ozon. Выберите ставку НДС:
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors">
                <input type="radio" name="vat" value="0" checked={ozonVat === "0"} onChange={(e) => setOzonVat(e.target.value)} className="w-5 h-5" />
                <span className="font-medium">Без НДС (0%)</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors">
                <input type="radio" name="vat" value="0.1" checked={ozonVat === "0.1"} onChange={(e) => setOzonVat(e.target.value)} className="w-5 h-5" />
                <span className="font-medium">НДС 10%</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors border-blue-500/50 bg-blue-50/10">
                <input type="radio" name="vat" value="0.2" checked={ozonVat === "0.2"} onChange={(e) => setOzonVat(e.target.value)} className="w-5 h-5" />
                <span className="font-medium">НДС 20% (Стандарт)</span>
              </label>
            </div>

            {ozonResult && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${ozonResult.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {ozonResult.message}
              </div>
            )}

            <button
              onClick={handleOzonExport}
              disabled={isExportingOzon}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isExportingOzon ? <Loader2 className="animate-spin" size={20} /> : null}
              {isExportingOzon ? 'Отправка...' : 'Подтвердить выгрузку'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
