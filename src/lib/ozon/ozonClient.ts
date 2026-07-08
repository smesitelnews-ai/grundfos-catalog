// HTTP-клиент для работы с Ozon Seller API
// Документация: https://docs.ozon.ru/api/seller/

const OZON_API_BASE = 'https://api-seller.ozon.ru';

interface OzonRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}

/**
 * Выполняет запрос к Ozon Seller API с автоматической авторизацией.
 * Заголовки Client-Id и Api-Key берутся из переменных окружения.
 */
export async function ozonFetch<T = unknown>(
  endpoint: string,
  options: OzonRequestOptions = {}
): Promise<T> {
  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error(
      'Не заданы переменные окружения OZON_CLIENT_ID и OZON_API_KEY. ' +
      'Добавьте их в файл .env.local'
    );
  }

  const { method = 'POST', body } = options;

  const response = await fetch(`${OZON_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Client-Id': clientId,
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ozon API ошибка ${response.status}: ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}
