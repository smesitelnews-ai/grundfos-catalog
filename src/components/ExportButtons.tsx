'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
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
      const asPdf = pdf(doc); // Create a fresh PDF instance
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

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <button 
        onClick={handleExcel} 
        disabled={isExportingExcel}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {isExportingExcel ? <Loader2 className="animate-spin" size={20} /> : <FileSpreadsheet size={20} />}
        Скачать {isSingle ? 'Excel' : 'Прайс-лист (Excel)'}
      </button>

      <button 
        onClick={handlePdf}
        disabled={isExportingPdf}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {isExportingPdf ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
        Скачать {isSingle ? 'КП (PDF)' : 'Каталог (PDF)'}
      </button>
    </div>
  );
}
