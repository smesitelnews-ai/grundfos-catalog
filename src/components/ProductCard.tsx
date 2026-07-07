import React from 'react';
import { ExternalLink, Check, Clock, TrendingDown, Truck, Tag, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  quantity: number;
  shops: Shop[];
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <Link href={`/product/${product.article}`} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group block border-2 border-transparent hover:border-red-500/30">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
        <span className="bg-red-500 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 shadow-red-500/20">
          <TrendingDown size={16} /> Наша цена: {formatPrice(product.our_price)}
        </span>
        {product.quantity > 0 && (
          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Package size={12} /> В наличии: {product.quantity} шт.
          </span>
        )}
      </div>
      
      <div className="w-full h-56 relative bg-white/5 flex items-center justify-center p-6 mt-4">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="text-red-400 text-xs font-mono mb-1 tracking-wider font-bold">
          Арт. {product.article}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
          {product.name}
        </h3>
        
        {/* Доставка и промокод */}
        <div className="mb-5 space-y-2 bg-slate-800/50 rounded-xl p-3 border border-white/5">
          {product.quantity > 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <Truck size={16} />
              <span>Доставка по Москве сегодня!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-400 font-medium">
              <Clock size={16} />
              <span>Под заказ: доставка через 20 дней</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-amber-400/10 w-fit px-2 py-1 rounded">
            <Tag size={12} />
            <span>Скидочный промокод при доставке</span>
          </div>
        </div>
        
        <div className="space-y-3 mt-auto">
          <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Цены конкурентов</h4>
          <div className="flex flex-col gap-2">
            {product.shops.map((shop, idx) => (
              <a 
                key={idx}
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-black/20 transition-all duration-200 hover:bg-white/5 group/link"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-300 group-hover/link:text-white line-through decoration-red-500/50">{shop.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 line-through decoration-red-500/50">
                    {shop.price_text.replace('Ссылка', '').trim()}
                  </span>
                  <ExternalLink size={14} className="text-slate-500 group-hover/link:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
