import axios from 'axios';
import { env } from '@/config/env';
import type { AdapterResult, Article, SearchFilters } from '../types';
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
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<AdapterResult> {
  const apiKey = env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return { articles: [], hasMore: false };
  }

  // NewsAPI pageSize is capped at 100
  const clampedPageSize = Math.min(pageSize, 100);

  const params = new URLSearchParams({
    apiKey,
    pageSize: String(clampedPageSize),
    page: String(page),
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

  const category = filters.categories?.[0] ?? filters.category;
  if (category && !filters.keyword) {
    params.set('category', category);
  }

  try {
    const response = await axios.get<NewsAPIResponse>(`${BASE_URL}${endpoint}?${params}`);
    const { totalResults, articles } = response.data;
    const transformedArticles = articles.map((article) =>
      transformNewsAPIArticle(article, filters.category)
    );

    const fetchedSoFar = page * clampedPageSize;
    const hasMore = fetchedSoFar < totalResults;

    return {
      articles: transformedArticles,
      totalResults,
      hasMore,
    };
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return { articles: [], hasMore: false };
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
