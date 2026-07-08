import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportToExcel(products: any[], singleProduct: boolean = false) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Каталог Grundfos');

  // Определяем колонки
  worksheet.columns = [
    { header: 'Артикул', key: 'article', width: 15 },
    { header: 'Фото', key: 'image', width: 25 }, // Колонка для фото
    { header: 'Название', key: 'name', width: 40 },
    { header: 'Цена', key: 'our_price', width: 15 },
    { header: 'Наличие', key: 'quantity', width: 15 },
    { header: 'Характеристики', key: 'specs', width: 60 },
  ];

  // Стилизация заголовков
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }; // Красный фон Grundfos
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
    // Форматируем характеристики в текст
    let specsText = '';
    if (p.specs) {
      specsText = Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('\n');
    }

    const row = worksheet.addRow({
      article: p.article,
      name: p.name,
      our_price: p.our_price + ' ₽',
      quantity: p.quantity > 0 ? `${p.quantity} шт.` : 'Под заказ',
      specs: specsText,
    });

    // Настраиваем высоту строки для картинки
    row.height = 100;
    
    // Включаем перенос текста для характеристик
    row.getCell('specs').alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
    row.getCell('name').alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell('article').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('our_price').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };

    // Загружаем картинку
    try {
      const imagePath = `/images/pumps_v4/${p.article}.jpg`;
      // Выполняем fetch к локальному изображению
      const response = await fetch(imagePath);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: arrayBuffer,
          extension: 'jpeg',
        });
        
        // Вставляем картинку во вторую колонку ('image') текущей строки
        // Координаты exceljs: tl: { col, row } -> (0-based индексы, где col 0 - это первая колонка A)
        // Колонка 'B' это индекс 1
        worksheet.addImage(imageId, {
          tl: { col: 1.1, row: row.number - 1 + 0.1 },
          br: { col: 1.9, row: row.number - 0.1 },
          editAs: 'oneCell'
        } as any);
      }
    } catch (e) {
      console.warn("Could not load image for", p.article, e);
    }
  }

  // Генерация и сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = singleProduct ? `Grundfos_${products[0].article}.xlsx` : 'Grundfos_Catalog.xlsx';
  saveAs(blob, filename);
}
