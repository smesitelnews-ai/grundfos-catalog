import React from 'react';
import { ExternalLink, Check, Clock, TrendingDown } from 'lucide-react';
import Image from 'next/image';

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
  shops: Shop[];
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group">
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <TrendingDown size={14} /> От {formatPrice(product.min_price)}
        </span>
      </div>
      
      <div className="w-full h-56 relative bg-white/5 flex items-center justify-center p-6">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="text-muted-foreground text-xs font-mono mb-1 tracking-wider">
          Арт. {product.article}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="space-y-3 mt-auto">
          <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Цены в магазинах</h4>
          <div className="flex flex-col gap-2">
            {product.shops.map((shop, idx) => (
              <a 
                key={idx}
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-white/5 group/link ${
                  shop.price === product.min_price 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-white/10 bg-black/20'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200 group-hover/link:text-white">{shop.name}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {shop.in_stock ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Clock size={12} className="text-amber-400" />
                    )}
                    <span className={`text-[10px] ${shop.in_stock ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {shop.in_stock ? 'В наличии' : 'Под заказ'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${shop.price === product.min_price ? 'text-red-400' : 'text-white'}`}>
                    {shop.price_text.replace('Ссылка', '').trim()}
                  </span>
                  <ExternalLink size={16} className="text-slate-400 group-hover/link:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
