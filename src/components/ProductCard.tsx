import React from 'react';
import { ExternalLink, ShoppingCart, Truck, Tag } from 'lucide-react';
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

import { useCart } from '../store/useCart';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      article: product.article,
      name: product.name,
      price: product.our_price,
      image: product.image,
      max_quantity: product.quantity
    });
  };

  return (
    <Link href={`/product/${product.article}`} className="glass-card rounded-xl overflow-hidden flex flex-col h-full relative group block hover:shadow-lg transition-shadow bg-card">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.shops[0]?.price > product.our_price && (
          <span className="bg-[#f91155] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            -{Math.round((product.shops[0].price - product.our_price) / product.shops[0].price * 100)}%
          </span>
        )}
        {product.quantity > 0 && (
          <span className="bg-[#00b14f] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            В наличии
          </span>
        )}
      </div>
      
      {/* Image container */}
      <div className="relative aspect-square bg-white p-4">
        {/* Fire & Water Badge */}
        <div className="absolute top-2 right-2 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-[#f91155] via-[#fc8b14] to-[#005bff] flex flex-col items-center justify-center shadow-md border-2 border-white text-white rotate-[15deg] transform hover:scale-110 transition-transform">
          <span className="text-[8px] font-black tracking-tighter uppercase leading-none mt-0.5">Grundfos</span>
          <span className="text-[6px] font-bold uppercase leading-tight mt-0.5">Оригинал</span>
        </div>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col border-t border-border">
        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {formatPrice(product.our_price)}
            </span>
          </div>
          {product.shops.length > 0 && (
            <div className="text-sm text-muted-foreground line-through decoration-red-500/50">
              {product.shops[0].price_text.replace('Ссылка', '').trim()}
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-[15px] font-medium text-foreground mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Specs snippet */}
        <div className="mb-4 text-xs text-muted-foreground space-y-1 mt-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Артикул:</span>
            <span className="text-foreground font-medium">{product.article}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Доставка:</span>
            <span className="text-green-500 font-medium">сегодня</span>
          </div>
        </div>
        
        {/* Add to cart button */}
        <button 
          className="w-full bg-primary hover:brightness-110 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={18} />
          <span>В корзину</span>
        </button>
      </div>
    </Link>
  );
}
