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

  const imagePath = `/images/pumps_v4/${product.article}.jpg`;
  const localPath = path.join(process.cwd(), 'public', imagePath);
  const hasRealImage = fs.existsSync(localPath);
  const displayImage = hasRealImage ? imagePath : '/images/grundfos_pump.png';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span>Вернуться в каталог</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Левая колонка: Изображение */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[400px]">
            <div className="absolute top-6 left-6 z-10">
              {product.quantity > 0 && (
                <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                  <Package size={16} /> В наличии: {product.quantity} шт.
                </span>
              )}
            </div>
            <Image 
              src={displayImage} 
              alt={product.name} 
              fill
              className="object-contain p-12 drop-shadow-2xl"
            />
            {product.market_image && (
              <div className="absolute bottom-6 left-6 right-6 flex justify-center z-20">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 flex gap-4">
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden cursor-pointer border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Image src={displayImage} alt="Main" fill className="object-cover" />
                  </div>
                  <a href={product.market_image} target="_blank" rel="noreferrer" className="w-20 h-20 relative rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-white/50 transition-all opacity-80 hover:opacity-100" title="Фото из Яндекс Маркета">
                    <Image src={product.market_image} alt="Market" fill className="object-cover bg-white" />
                  </a>
                </div>
              </div>
            )}
            {/* Значок оригинальности */}
            <div className="absolute top-8 right-8 w-24 h-24 drop-shadow-2xl z-10 opacity-90 hover:opacity-100 hover:rotate-12 hover:scale-110 transition-all cursor-pointer" title="Оригинальный товар">
              <Image
                src="/images/badge.png"
                alt="100% Original"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Правая колонка: Основная информация */}
          <div className="flex flex-col">
            <div className="text-red-500 font-mono tracking-wider mb-2 font-bold text-lg">
              АРТ: {product.article}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              {product.name}
            </h1>
            
            {/* Наша цена и преимущества */}
            <div className="glass-card rounded-2xl p-6 mb-8 border-red-500/30 bg-red-500/5">
              <div className="flex flex-col mb-4">
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Специальное предложение</span>
                <div className="text-4xl md:text-5xl font-black text-red-500">{formatPrice(product.our_price)}</div>
              </div>
              
              <div className="space-y-3 mt-6">
                {product.quantity > 0 ? (
                  <div className="flex items-center gap-3 text-emerald-400 font-medium bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">
                    <Truck size={20} className="flex-shrink-0" />
                    <span>Доставка по Москве в день обращения, или отгрузка транспортной компанией</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-400 font-medium bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                    <Clock size={20} />
                    <span>Под заказ: доставка через 20 дней</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-amber-400 font-medium bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                  <Tag size={20} />
                  <span>Скидочный промокод при доставке в подарок</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20">
                <ShoppingCart size={20} /> Оформить заказ
              </button>
            </div>
            
            {product.description && (
              <div className="mb-8 bg-black/20 rounded-2xl p-6 border border-white/5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                  <Info className="text-red-500" /> Описание
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-400 mb-4">
                Для сравнения: цены конкурентов
              </h3>
              <div className="space-y-2 opacity-70 hover:opacity-100 transition-opacity">
                {product.shops.map((shop: any, idx: number) => (
                  <a 
                    key={idx}
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-400 line-through decoration-red-500/50">{shop.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-slate-500 line-through decoration-red-500/50">
                        {shop.price_text.replace('Ссылка', '').trim()}
                      </span>
                      <ExternalLink size={16} className="text-slate-600" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Блок характеристик на всю ширину */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-16 glass-card rounded-3xl p-8 md:p-12">
            <h3 className="flex items-center gap-3 text-2xl font-black text-white mb-8">
              <Settings className="text-red-500" size={28} /> Технические характеристики
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors">
                  <span className="text-slate-400 pr-4">{key}</span>
                  <span className="text-white font-medium text-right font-mono text-sm max-w-[60%]">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
