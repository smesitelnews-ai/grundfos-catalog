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
    <Link href={`/product/${product.article}`} className="glass-card rounded-xl overflow-hidden flex flex-col h-full relative group block hover:shadow-lg transition-shadow bg-white">
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
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col border-t border-gray-100">
        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {formatPrice(product.our_price)}
            </span>
          </div>
          {product.shops.length > 0 && (
            <div className="text-sm text-gray-400 line-through decoration-red-500/50">
              {product.shops[0].price_text.replace('Ссылка', '').trim()}
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-[15px] font-medium text-gray-800 mb-4 line-clamp-2 leading-snug group-hover:text-[#005bff] transition-colors">
          {product.name}
        </h3>
        
        {/* Specs snippet */}
        <div className="mb-4 text-xs text-gray-500 space-y-1 mt-auto">
          <div className="flex justify-between">
            <span className="text-gray-400">Артикул:</span>
            <span className="text-gray-700 font-medium">{product.article}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Доставка:</span>
            <span className="text-green-600 font-medium">от 1 дня</span>
          </div>
        </div>
        
        {/* Add to cart button */}
        <button 
          className="w-full bg-[#005bff] hover:bg-[#004cd6] text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={18} />
          <span>В корзину</span>
        </button>
      </div>
    </Link>
  );
}
