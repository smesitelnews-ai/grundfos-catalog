import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Info, Settings, Truck, Tag, Package, ShoppingCart, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import AddToCartButton from '../../../components/AddToCartButton';

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

  const imagePath = `/images/pumps_v9/${product.article}.jpg`;
  const localPath = path.join(process.cwd(), 'public', imagePath);
  const hasRealImage = fs.existsSync(localPath);
  const displayImage = hasRealImage ? imagePath : '/images/grundfos_pump.png';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative z-10 bg-background">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft size={20} />
          <span>Вернуться в каталог</span>
        </Link>
        
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Левая колонка: Изображение */}
            <div className="p-8 flex flex-col items-center justify-center relative min-h-[400px] border-b lg:border-b-0 lg:border-r border-border bg-white rounded-l-2xl">
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                {product.shops[0]?.price > product.our_price && (
                  <span className="bg-[#f91155] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    Скидка {Math.round((product.shops[0].price - product.our_price) / product.shops[0].price * 100)}%
                  </span>
                )}
                {product.quantity > 0 && (
                  <span className="bg-[#00b14f] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                    <Package size={16} /> В наличии: {product.quantity} шт.
                  </span>
                )}
              </div>
              
              {/* Fire & Water Badge */}
              <div className="absolute top-6 right-6 z-20 w-24 h-24 rounded-full bg-gradient-to-br from-[#f91155] via-[#fc8b14] to-[#005bff] flex flex-col items-center justify-center shadow-lg border-4 border-white text-white rotate-[15deg] transform hover:scale-110 transition-transform">
                <span className="text-[14px] font-black tracking-tighter uppercase leading-none mt-1">Grundfos</span>
                <span className="text-[10px] font-bold uppercase leading-tight mt-0.5">Оригинал</span>
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
              <div className="text-muted-foreground font-mono tracking-wider mb-2 text-sm">
                Артикул: {product.article}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">
                {product.name}
              </h1>
              
              {/* Наша цена */}
              <div className="mb-8">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{formatPrice(product.our_price)}</span>
                  {product.shops.length > 0 && (
                    <span className="text-xl text-muted-foreground line-through decoration-red-500/50">{product.shops[0].price_text.replace('Ссылка', '').trim()}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                {product.quantity > 0 ? (
                  <div className="flex items-center gap-3 text-green-500 font-medium bg-green-500/10 px-4 py-3 rounded-xl">
                    <Truck size={20} className="flex-shrink-0" />
                    <span>Доставка по Москве сегодня</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-500 font-medium bg-amber-500/10 px-4 py-3 rounded-xl">
                    <Clock size={20} />
                    <span>Под заказ: доставка через 20 дней</span>
                  </div>
                )}
              </div>
              
              <AddToCartButton 
                product={{
                  article: product.article,
                  name: product.name,
                  our_price: product.our_price,
                  image: displayImage,
                  quantity: product.quantity
                }} 
              />
              
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-3">Описание</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Блок характеристик на всю ширину */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-8 bg-card rounded-2xl p-8 md:p-10 border border-border shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-8">Характеристики</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-border last:border-b-0 md:last:border-b">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="text-foreground font-medium text-right max-w-[60%]">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Блок цен конкурентов */}
        {product.shops && product.shops.length > 0 && (
          <div className="mt-8 mb-8 bg-card rounded-2xl p-8 md:p-10 border border-border shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-8">Сравнение цен (Конкуренты)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="py-4 px-4 font-medium">Магазин</th>
                    <th className="py-4 px-4 font-medium text-center">Наличие</th>
                    <th className="py-4 px-4 font-medium text-right">Цена</th>
                    <th className="py-4 px-4 font-medium text-center">Ссылка</th>
                  </tr>
                </thead>
                <tbody>
                  {product.shops.map((shop: any, idx: number) => (
                    <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-foreground">
                        {shop.name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {shop.in_stock ? (
                          <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2.5 py-1.5 rounded-md">В наличии</span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium bg-muted px-2.5 py-1.5 rounded-md">Под заказ</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-foreground whitespace-nowrap">
                        {formatPrice(shop.price)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <a 
                          href={shop.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
                          title={`Перейти на сайт ${shop.name}`}
                        >
                          <ExternalLink size={18} />
                        </a>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Строка с нашей ценой */}
                  <tr className="bg-primary/10 border-t-2 border-primary">
                    <td className="py-5 px-4 font-bold text-primary flex items-center gap-2">
                      Наше предложение
                      <Tag size={16} className="text-primary" />
                    </td>
                    <td className="py-5 px-4 text-center">
                      {product.quantity > 0 ? (
                        <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2.5 py-1.5 rounded-md shadow-sm">В наличии: {product.quantity}</span>
                      ) : (
                        <span className="text-amber-500 text-xs font-medium bg-amber-500/10 px-2.5 py-1.5 rounded-md">Под заказ</span>
                      )}
                    </td>
                    <td className="py-5 px-4 text-right font-black text-foreground text-xl whitespace-nowrap">
                      {formatPrice(product.our_price)}
                    </td>
                    <td className="py-5 px-4 text-center text-sm font-bold text-primary">
                      Выгоднее!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
