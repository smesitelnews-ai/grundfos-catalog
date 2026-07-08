import fs from 'fs';
import path from 'path';
import CatalogClient from '@/components/CatalogClient';
import ExportButtons from '@/components/ExportButtons';
import Image from 'next/image';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);

  // Обогащаем товары реальными путями к картинкам
  const enrichedProducts = products.map((product: any) => {
    const imagePath = `/images/pumps_v8/${product.article}.jpg`;
    const localPath = path.join(process.cwd(), 'public', imagePath);
    const hasRealImage = fs.existsSync(localPath);
    return {
      ...product,
      image: hasRealImage ? imagePath : '/images/grundfos_pump.png'
    };
  });

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#f5f6f8]">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Map and Contacts Sidebar */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="relative w-28 h-28 mb-3 hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/images/logo41.png" 
                  alt="41 км МКАД" 
                  fill 
                  className="object-contain" 
                  priority
                />
              </div>
              <div className="w-full text-center">
                <span className="text-lg font-black text-gray-900 tracking-wide uppercase mb-3 text-center block">
                  Складские остатки <br/> <span className="text-[#005bff]">41км МКАД ряд Б, 2/1</span> 📍
                </span>
                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 h-[200px] w-full relative">
                  <iframe 
                    src="https://yandex.ru/map-widget/v1/-/CTu4eMKR" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowFullScreen={true}
                    className="absolute inset-0"
                  ></iframe>
                </div>
              </div>
              <a href="tel:8777414141" className="bg-[#f91155] hover:bg-[#d60e48] text-white font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-lg w-full">
                Звоните 8 777 41 41 41
              </a>
            </div>

            {/* Title & Info */}
            <div className="w-full md:w-2/3 space-y-6 flex flex-col justify-center py-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Grundfos <span className="text-[#005bff]">Оригинал</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                Официальные поставки оборудования. Мы находим лучшие предложения.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <ExportButtons products={enrichedProducts} />
              </div>
            </div>

          </div>
        </header>
        
        <CatalogClient products={enrichedProducts} />
      </div>
    </main>
  );
}
