import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportToExcel(products: any[], singleProduct: boolean = false) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Каталог Grundfos');

  // Collect all unique specs to create columns
  const allSpecKeys = new Set<string>();
  products.forEach(p => {
    if (p.specs) {
      Object.keys(p.specs).forEach(k => allSpecKeys.add(k));
    }
  });
  
  const specColumns = Array.from(allSpecKeys).map(key => ({
    header: key,
    key: key,
    width: 25,
  }));

  // Define columns
  worksheet.columns = [
    { header: 'Артикул', key: 'article', width: 15 },
    { header: 'Фото', key: 'image', width: 20 },
    { header: 'Название', key: 'name', width: 45 },
    { header: 'Цена', key: 'our_price', width: 15 },
    { header: 'Наличие', key: 'quantity', width: 15 },
    { header: 'Инфографика', key: 'promo_link', width: 25 },
    { header: 'Оригинал', key: 'image_link', width: 25 },
    ...specColumns
  ];
  
  // Headers style
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfc8b14' } }; // DNS orange
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imagePath = p.image || `/images/pumps/${p.article}.jpg`;
    const promoPath = p.promo_image || `/images/pumps_v9/${p.article}.jpg`;
    
    // For local dev, imagePath will hit localhost. For Excel links, we provide absolute urls.
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://grundfos-catalog-demo.vercel.app';
    const fullImageUrl = `${baseUrl}${imagePath}`;
    const fullPromoUrl = `${baseUrl}${promoPath}`;
    
    const rowData: any = {
      article: p.article,
      name: p.name,
      our_price: p.our_price + ' ₽',
      quantity: p.quantity > 0 ? `${p.quantity} шт.` : 'Под заказ',
    };
  
    if (p.specs) {
      Object.entries(p.specs).forEach(([k, v]) => {
        rowData[k] = v;
      });
    }
  
    const row = worksheet.addRow(rowData);
  
    // Image row height (105 points is ~140 pixels)
    row.height = 105;
    
    row.getCell('name').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.getCell('article').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('our_price').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Links
    row.getCell('promo_link').value = { text: "Смотреть с фоном", hyperlink: fullPromoUrl };
    row.getCell('promo_link').font = { color: { argb: 'FF0563C1' }, underline: true };
    row.getCell('promo_link').alignment = { vertical: 'middle', horizontal: 'center' };

    row.getCell('image_link').value = { text: "Оригинал фото", hyperlink: fullImageUrl };
    row.getCell('image_link').font = { color: { argb: 'FF0563C1' }, underline: true };
    row.getCell('image_link').alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Style specs cells
    specColumns.forEach((col, idx) => {
      row.getCell(8 + idx).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  
    // Load Image with correct Aspect Ratio
    try {
      const response = await fetch(imagePath);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: arrayBuffer,
          extension: 'jpeg',
        });
        
        // Получаем размеры картинки через браузерный API для сохранения пропорций
        const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
        const img = new globalThis.Image();
        img.src = blobUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        
        // Вписываем картинку в ячейку (максимум 120x120px)
        const maxDim = 120;
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const extW = Math.round(img.width * scale);
        const extH = Math.round(img.height * scale);
        
        // Рассчитываем отступы, чтобы картинка была по центру ячейки
        const cellWidthPx = 140; // width 20 is ~140px
        const cellHeightPx = 140; // row height 105 is ~140px
        const offsetX = (cellWidthPx - extW) / 2 / cellWidthPx;
        const offsetY = (cellHeightPx - extH) / 2 / cellHeightPx;
        
        worksheet.addImage(imageId, {
          tl: { col: 1 + offsetX, row: row.number - 1 + offsetY },
          ext: { width: extW, height: extH },
          editAs: 'oneCell'
        } as any);
        
        URL.revokeObjectURL(blobUrl);
      }
    } catch (e) {
      console.warn("Could not load image for", p.article, e);
    }
  }

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = singleProduct ? `Grundfos_${products[0].article}.xlsx` : 'Grundfos_Catalog.xlsx';
  saveAs(blob, filename);
}
