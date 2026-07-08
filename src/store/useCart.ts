import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  article: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  max_quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (article: string) => void;
  updateQuantity: (article: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.article === item.article);
          if (existingItem) {
            return {
              items: state.items.map((i) => 
                i.article === item.article 
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.max_quantity > 0 ? i.max_quantity : 99) } 
                  : i
              )
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      
      removeItem: (article) => {
        set((state) => ({
          items: state.items.filter((i) => i.article !== article)
        }));
      },
      
      updateQuantity: (article, quantity) => {
        set((state) => ({
          items: state.items.map((i) => 
            i.article === article 
              ? { ...i, quantity: quantity } 
              : i
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'grundfos-cart',
    }
  )
);
