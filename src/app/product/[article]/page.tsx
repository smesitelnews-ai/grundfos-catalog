import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Check, Clock, Info, Settings } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);
  
  return products.map((product: any) => ({
    article: product.article,
  }));
}

export default function ProductPage({ params }: { params: { article: string } }) {
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);
  
  const product = products.find((p: any) => p.article === params.article);
  
  if (!product) {
    notFound();
  }

  const imagePath = `/images/pumps/${product.article}.jpg`;
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
          <div className="glass-panel rounded-3xl p-8 flex items-center justify-center relative min-h-[400px]">
            <Image 
              src={displayImage} 
              alt={product.name} 
              fill
              className="object-contain p-8 drop-shadow-2xl"
            />
          </div>

          {/* Правая колонка: Основная информация */}
          <div className="flex flex-col">
            <div className="text-red-500 font-mono tracking-wider mb-2 font-bold">
              АРТ: {product.article}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              {product.name}
            </h1>
            
            {product.description && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
                  <Info className="text-red-500" /> Описание
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap opacity-80">
                  {product.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                Сравнение цен в магазинах
              </h3>
              <div className="space-y-3">
                {product.shops.map((shop: any, idx: number) => (
                  <a 
                    key={idx}
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                      shop.price === product.min_price 
                        ? 'border-red-500/50 bg-gradient-to-r from-red-500/20 to-transparent' 
                        : 'border-white/10 bg-black/30 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-200">{shop.name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {shop.in_stock ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Clock size={14} className="text-amber-400" />
                        )}
                        <span className={`text-xs ${shop.in_stock ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {shop.in_stock ? 'В наличии' : 'Под заказ'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black ${shop.price === product.min_price ? 'text-red-400' : 'text-white'}`}>
                        {shop.price_text.replace('Ссылка', '').trim()}
                      </span>
                      <ExternalLink size={20} className="text-slate-500" />
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
                <div key={key} className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400 pr-4">{key}</span>
                  <span className="text-white font-medium text-right font-mono text-sm max-w-[50%]">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
