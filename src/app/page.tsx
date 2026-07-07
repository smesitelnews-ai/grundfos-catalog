import fs from 'fs';
import path from 'path';
import { Droplets } from 'lucide-react';
import CatalogClient from '@/components/CatalogClient';

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
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
            <Droplets size={32} className="text-red-500" />
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
