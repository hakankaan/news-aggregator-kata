import axios from 'axios';
import { env } from '@/config/env';
import type { Article, SearchFilters } from '../types';
import { generateArticleId } from './article-utils';

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
    endpoint = '/top-headlines';
    params.set('language', 'en');
  }

  if (filters.dateFrom) {
    params.set('from', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('to', filters.dateTo);
  }

  // NewsAPI only supports single category - use first from array or single category
  const category = filters.categories?.[0] ?? filters.category;
  if (category && !filters.keyword) {
    params.set('category', category);
  }

  try {
    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}${endpoint}?${params}`);
    return response.data.articles.map((article) =>
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
    id: generateArticleId('newsapi', article.url),
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
