'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '../store/useCart';

interface AddToCartButtonProps {
  product: {
    article: string;
    name: string;
    our_price: number;
    image: string;
    quantity: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      article: product.article,
      name: product.name,
      price: product.our_price,
      image: product.image,
      max_quantity: product.quantity
    });
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full mb-8 bg-[#005bff] hover:bg-[#004cd6] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-lg"
    >
      <ShoppingCart size={22} /> В корзину
    </button>
  );
}
