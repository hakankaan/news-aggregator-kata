import { env } from '@/config/env';
import type { Article, SearchFilters } from '../types';

interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

const BASE_URL = 'https://newsapi.org/v2';

export async function fetchFromNewsAPI(
  filters: SearchFilters
): Promise<Article[]> {
  const apiKey = env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  const params = new URLSearchParams({
    apiKey,
    pageSize: '20',
  });

  let endpoint = '/everything';

  if (filters.keyword) {
    params.set('q', filters.keyword);
  } else {
    // NewsAPI requires a query for /everything endpoint
    endpoint = '/top-headlines';
    params.set('language', 'en');
  }

  if (filters.dateFrom) {
    params.set('from', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('to', filters.dateTo);
  }

  if (filters.category && !filters.keyword) {
    params.set('category', filters.category);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();
    return data.articles.map((article) =>
      transformNewsAPIArticle(article, filters.category)
    );
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

function transformNewsAPIArticle(
  article: NewsAPIArticle,
  requestedCategory?: string
): Article {
  return {
    id: `newsapi-${btoa(article.url).slice(0, 20)}`,
    title: article.title,
    description: article.description ?? '',
    content: article.content ?? '',
    author: article.author ?? undefined,
    source: {
      id: article.source.id ?? article.source.name.toLowerCase().replace(/\s+/g, '-'),
      name: article.source.name,
      provider: 'newsapi',
    },
    category: requestedCategory ?? 'general',
    publishedAt: article.publishedAt,
    imageUrl: article.urlToImage,
    url: article.url,
  };
}
