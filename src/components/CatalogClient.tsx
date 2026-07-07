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
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus-within:border-red-500/50 transition-colors">
          <Search className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по артикулу или названию..." 
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Тип насоса</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:border-red-500/50 focus:outline-none transition-colors appearance-none"
            >
              {types.map(t => (
                <option key={t as string} value={t as string} className="bg-slate-800 text-white">{t as string}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Сортировка</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:border-red-500/50 focus:outline-none transition-colors appearance-none"
            >
              <option value="price-asc" className="bg-slate-800 text-white">Сначала дешевле</option>
              <option value="price-desc" className="bg-slate-800 text-white">Сначала дороже</option>
              <option value="name-asc" className="bg-slate-800 text-white">По названию (А-Я)</option>
              <option value="name-desc" className="bg-slate-800 text-white">По названию (Я-А)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Цена (₽)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="От" 
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 focus:border-red-500/50 focus:outline-none transition-colors placeholder:text-slate-600"
              />
              <input 
                type="number" 
                placeholder="До" 
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 focus:border-red-500/50 focus:outline-none transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${inStockOnly ? 'bg-red-500 border-red-500' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                {inStockOnly && <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Только в наличии</span>
            </label>
            {/* hidden checkbox */}
            <input 
              type="checkbox" 
              className="hidden"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <Filter size={16} />
            <span>Найдено: <strong className="text-white">{filteredProducts.length}</strong> из {products.length} товаров</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.article} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-700">
          <div className="bg-slate-800/50 p-4 rounded-full mb-4">
            <Box size={48} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Товары не найдены</h3>
          <p className="text-slate-400 max-w-md">
            По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
        </div>
      )}
    </div>
  );
}
