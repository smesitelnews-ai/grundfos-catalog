'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../store/useCart';
import { useState, useEffect } from 'react';
import CartSidebar from './CartSidebar';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCart((state) => state.getTotalItems());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Чтобы избежать ошибки гидратации из-за localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">Grundfos</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <a href="tel:8777414141" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                8 777 41 41 41
              </a>
              <span className="text-xs text-muted-foreground">Без выходных 09:00 - 20:00</span>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && getTotalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary border-2 border-card rounded-full">
                  {getTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
