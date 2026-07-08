import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Info, Settings, Truck, Tag, Package, ShoppingCart, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);
  
  return products.map((product: any) => ({
    article: product.article,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ article: string }> }) {
  const { article } = await params;
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);
  
  const product = products.find((p: any) => p.article === article);
  
  if (!product) {
    notFound();
  }

  const imagePath = `/images/pumps_v8/${product.article}.jpg`;
  const localPath = path.join(process.cwd(), 'public', imagePath);
  const hasRealImage = fs.existsSync(localPath);
  const displayImage = hasRealImage ? imagePath : '/images/grundfos_pump.png';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#f5f6f8]">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#005bff] mb-8 transition-colors font-medium">
          <ArrowLeft size={20} />
          <span>Вернуться в каталог</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Левая колонка: Изображение */}
            <div className="p-8 flex flex-col items-center justify-center relative min-h-[400px] border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                <span className="bg-[#f91155] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  Скидка {Math.round((product.shops[0]?.price - product.our_price) / product.shops[0]?.price * 100 || 10)}%
                </span>
                {product.quantity > 0 && (
                  <span className="bg-[#00b14f] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                    <Package size={16} /> В наличии: {product.quantity} шт.
                  </span>
                )}
              </div>
              <Image 
                src={displayImage} 
                alt={product.name} 
                fill
                className="object-contain p-12"
              />
              </div>

            {/* Правая колонка: Основная информация */}
            <div className="p-8 lg:p-10 flex flex-col">
              <div className="text-gray-400 font-mono tracking-wider mb-2 text-sm">
                Артикул: {product.article}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>
              
              {/* Наша цена */}
              <div className="mb-8">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{formatPrice(product.our_price)}</span>
                  {product.shops.length > 0 && (
                    <span className="text-xl text-gray-400 line-through decoration-red-500/50">{product.shops[0].price_text.replace('Ссылка', '').trim()}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                {product.quantity > 0 ? (
                  <div className="flex items-center gap-3 text-green-700 font-medium bg-green-50 px-4 py-3 rounded-xl">
                    <Truck size={20} className="flex-shrink-0" />
                    <span>Доставка по Москве от 1 дня</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-700 font-medium bg-amber-50 px-4 py-3 rounded-xl">
                    <Clock size={20} />
                    <span>Под заказ: доставка через 20 дней</span>
                  </div>
                )}
              </div>
              
              <a href="tel:8777414141" className="w-full mb-8 bg-[#005bff] hover:bg-[#004cd6] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-lg">
                <ShoppingCart size={22} /> В корзину (8 777 41 41 41)
              </a>
              
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Описание</h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Блок характеристик на всю ширину */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Характеристики</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-gray-100 last:border-b-0 md:last:border-b">
                  <span className="text-gray-500">{key}</span>
                  <span className="text-gray-900 font-medium text-right max-w-[60%]">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
