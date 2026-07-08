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
    { header: 'Фото', key: 'image', width: 25 },
    { header: 'Название', key: 'name', width: 40 },
    { header: 'Цена', key: 'our_price', width: 15 },
    { header: 'Наличие', key: 'quantity', width: 15 },
    ...specColumns
  ];

  // Headers style
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005bff' } }; // Ozon blue
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
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

    // Image row height
    row.height = 100;
    
    row.getCell('name').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.getCell('article').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('our_price').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Style specs cells
    specColumns.forEach((col, idx) => {
      row.getCell(6 + idx).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    // Load Image
    try {
      const imagePath = `/images/pumps_v8/${p.article}.jpg`; // Assuming v8 is generated
      const response = await fetch(imagePath);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: arrayBuffer,
          extension: 'jpeg',
        });
        
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

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = singleProduct ? `Grundfos_${products[0].article}.xlsx` : 'Grundfos_Catalog.xlsx';
  saveAs(blob, filename);
}
