// API route для получения СЫРОГО дерева категорий Ozon (для отладки)
import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

export async function GET() {
  try {
    const tree = await ozonFetch<any>(
      '/v1/description-category/tree',
      { body: { language: 'DEFAULT' } }
    );

    // Вернём первые 3 корневых элемента для анализа структуры
    const sample = tree.result?.slice(0, 3) || tree;

    return NextResponse.json({
      success: true,
      sample_structure: sample,
      total_root: Array.isArray(tree.result) ? tree.result.length : 'не массив',
      raw_keys: Object.keys(tree),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
