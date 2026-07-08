// API route для получения дерева категорий Ozon
// Используется для маппинга наших типов насосов на категории Озона
import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

// Интерфейсы ответа Ozon
interface OzonCategoryType {
  type_id: number;
  type_name: string;
}

interface OzonCategory {
  description_category_id: number;
  category_name: string;
  disabled: boolean;
  children: OzonCategory[];
  type_ids?: OzonCategoryType[];
}

interface OzonCategoryTreeResponse {
  result: OzonCategory[];
}

/**
 * GET /api/ozon/categories
 * Возвращает дерево категорий Ozon и ищет категории, связанные с насосами
 */
export async function GET() {
  try {
    // Запрашиваем полное дерево категорий
    const tree = await ozonFetch<OzonCategoryTreeResponse>(
      '/v1/description-category/tree',
      { body: { language: 'DEFAULT' } }
    );

    // Ищем категории, связанные с насосами
    const pumpKeywords = [
      'насос', 'помп', 'дренаж', 'циркуляцион',
      'канализ', 'скважин', 'колодез', 'водоснабж',
      'sololift', 'pump'
    ];

    const foundCategories: Array<{
      description_category_id: number;
      category_name: string;
      path: string;
      types: OzonCategoryType[];
    }> = [];

    // Рекурсивный поиск по дереву
    function searchTree(categories: OzonCategory[], path: string = '') {
      for (const cat of categories) {
        const currentPath = path ? `${path} → ${cat.category_name}` : cat.category_name;

        const nameLower = (cat.category_name || '').toLowerCase();
        const matches = pumpKeywords.some(kw => nameLower.includes(kw));

        if (matches && !cat.disabled) {
          foundCategories.push({
            description_category_id: cat.description_category_id,
            category_name: cat.category_name,
            path: currentPath,
            types: cat.type_ids || [],
          });
        }

        // Ищем глубже
        if (cat.children && cat.children.length > 0) {
          searchTree(cat.children, currentPath);
        }
      }
    }

    searchTree(tree.result);

    return NextResponse.json({
      success: true,
      total_categories: foundCategories.length,
      pump_categories: foundCategories,
      // Также вернём первые 5 корневых для контекста
      root_categories: tree.result.slice(0, 10).map(c => ({
        id: c.description_category_id,
        name: c.category_name,
        children_count: c.children?.length || 0,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
