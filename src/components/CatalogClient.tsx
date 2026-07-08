'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Box } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Shop {
  name: string;
  price: number;
  price_text: string;
  url: string;
  in_stock: boolean;
}

interface Product {
  article: string;
  name: string;
  min_price: number;
  our_price: number;
  shops: Shop[];
  image: string;
  description?: string;
  specs?: Record<string, string>;
  quantity: number;
}

export default function CatalogClient({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Все типы');
  const [sortOrder, setSortOrder] = useState('price-asc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');

  const types = ['Все типы', ...Array.from(new Set(products.map(p => p.specs?.['Тип насоса']).filter(Boolean)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.article.includes(searchQuery);
      
      const matchesType = selectedType === 'Все типы' || product.specs?.['Тип насоса'] === selectedType;
      
      const hasStock = product.quantity > 0 || product.shops.some(s => s.in_stock);
      const matchesStock = !inStockOnly || hasStock;
      
      const matchesMinPrice = !minPriceFilter || product.our_price >= parseInt(minPriceFilter);
      const matchesMaxPrice = !maxPriceFilter || product.our_price <= parseInt(maxPriceFilter);

      return matchesSearch && matchesType && matchesStock && matchesMinPrice && matchesMaxPrice;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc': return a.our_price - b.our_price;
        case 'price-desc': return b.our_price - a.our_price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
  }, [products, searchQuery, selectedType, sortOrder, inStockOnly, minPriceFilter, maxPriceFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-6">
          <h2 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">Фильтры</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Поиск</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Артикул, название..." 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-3 py-2 focus:border-[#005bff] focus:ring-1 focus:ring-[#005bff] outline-none transition-all placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Тип насоса</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:border-[#005bff] focus:ring-1 focus:ring-[#005bff] outline-none transition-all"
            >
              {types.map(t => (
                <option key={t as string} value={t as string}>{t as string}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Цена (₽)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="От" 
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:border-[#005bff] focus:ring-1 focus:ring-[#005bff] outline-none transition-all"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="До" 
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:border-[#005bff] focus:ring-1 focus:ring-[#005bff] outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${inStockOnly ? 'bg-[#005bff] border-[#005bff]' : 'bg-gray-50 border-gray-300 group-hover:border-[#005bff]'}`}>
                {inStockOnly && <Check size={14} className="text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Сначала в наличии</span>
            </label>
            <input 
              type="checkbox" 
              className="hidden"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 font-medium">
            Найдено товаров: <span className="text-gray-900 font-bold">{filteredProducts.length}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-500 whitespace-nowrap">Сортировка:</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent border-none text-gray-900 font-medium focus:ring-0 outline-none cursor-pointer"
            >
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="name-asc">По названию (А-Я)</option>
              <option value="name-desc">По названию (Я-А)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.article} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center flex flex-col items-center justify-center border border-gray-200 shadow-sm">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Box size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Товары не найдены</h3>
            <p className="text-gray-500 max-w-md">
              По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
