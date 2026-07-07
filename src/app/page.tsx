import fs from 'fs';
import path from 'path';
import CatalogClient from '@/components/CatalogClient';
import Image from 'next/image';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);

  // Обогащаем товары реальными путями к картинкам
  const enrichedProducts = products.map((product: any) => {
    const imagePath = `/images/pumps/${product.article}.jpg`;
    const localPath = path.join(process.cwd(), 'public', imagePath);
    const hasRealImage = fs.existsSync(localPath);
    return {
      ...product,
      image: hasRealImage ? imagePath : '/images/grundfos_pump.png'
    };
  });

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-md rounded-3xl mb-4 border border-white/10 shadow-2xl shadow-blue-500/10">
            <div className="relative w-32 h-32 mb-4 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <Image 
                src="/images/logo41.png" 
                alt="41 км МКАД" 
                fill 
                className="object-contain rounded-2xl" 
                priority
              />
            </div>
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-500 tracking-wider uppercase">
              Складские остатки 41км МКАД
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            Grundfos <span className="text-red-500">Premium</span> Catalog
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Автоматический мониторинг цен на оригинальные насосы Grundfos в магазинах РФ. Мы находим лучшие предложения.
          </p>
        </header>
        
        <CatalogClient products={enrichedProducts} />
      </div>
    </main>
  );
}
