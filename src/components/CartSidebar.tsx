'use client';

import { useState } from 'react';
import { useCart } from '../store/useCart';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const comment = formData.get('comment') as string;

    // Подготовка текста заказа для письма
    let orderText = `Новый заказ от ${name} (${phone})\n\n`;
    if (comment) orderText += `Комментарий: ${comment}\n\n`;
    orderText += `Товары:\n`;
    
    items.forEach((item, index) => {
      orderText += `${index + 1}. ${item.name} (Арт: ${item.article})\n`;
      orderText += `   Кол-во: ${item.quantity} шт. | Цена: ${item.price.toLocaleString('ru-RU')} ₽\n`;
    });
    
    orderText += `\nИТОГО: ${getTotalPrice().toLocaleString('ru-RU')} ₽`;

    try {
      // Отправка через Web3Forms
      // Для работы нужен ACCESS_KEY с сайта web3forms.com
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'ВАШ_КЛЮЧ_ЗДЕСЬ';
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Новый заказ на насосы - ${getTotalPrice().toLocaleString('ru-RU')} руб.`,
          from_name: 'Grundfos Catalog',
          message: orderText,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        clearCart();
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        console.error(result);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md w-full bg-white shadow-xl flex flex-col h-full animate-slide-in-right">
          
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Корзина
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">Корзина пуста</p>
                <p className="mt-1">Добавьте товары из каталога</p>
                <button 
                  onClick={onClose}
                  className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.article} className="flex gap-4 border-b border-gray-100 pb-4">
                    <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Арт: {item.article}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-gray-900">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.article, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.article, Math.min(item.max_quantity || 99, item.quantity + 1))}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.article)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium text-gray-900">Итого:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {getTotalPrice().toLocaleString('ru-RU')} ₽
                </span>
              </div>
              
              {submitStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                  <p className="font-bold">Заказ успешно оформлен!</p>
                  <p className="text-sm mt-1">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ваше имя"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Номер телефона"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                  <textarea
                    name="comment"
                    placeholder="Комментарий к заказу (необязательно)"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  />
                  
                  {submitStatus === 'error' && (
                    <p className="text-red-500 text-sm text-center">
                      Произошла ошибка при отправке. Пожалуйста, позвоните нам: 8 777 41 41 41
                    </p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? 'Отправка...' : 'Оформить заказ'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
