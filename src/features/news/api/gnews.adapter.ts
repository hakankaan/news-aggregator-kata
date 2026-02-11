import { env } from '@/config/env';
import type { Article, SearchFilters } from '../types';

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

const BASE_URL = 'https://gnews.io/api/v4';

export async function fetchFromGNews(
  filters: SearchFilters
): Promise<Article[]> {
  const apiKey = env.GNEWS_KEY;
  if (!apiKey) {
    console.warn('GNews key not configured');
    return [];
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    lang: 'en',
    max: '20',
  });

  let endpoint = '/top-headlines';

  if (filters.keyword) {
    endpoint = '/search';
    params.set('q', filters.keyword);
  }

  if (filters.dateFrom) {
    params.set('from', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('to', filters.dateTo);
  }

  if (filters.category) {
    params.set('topic', mapCategoryToGNewsTopic(filters.category));
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`GNews error: ${response.status}`);
    }

    const data: GNewsResponse = await response.json();
    return data.articles.map((article) =>
      transformGNewsArticle(article, filters.category)
    );
  } catch (error) {
    console.error('GNews fetch error:', error);
    return [];
  }
}

function mapCategoryToGNewsTopic(category: string): string {
  const mapping: Record<string, string> = {
    general: 'world',
    business: 'business',
    technology: 'technology',
    science: 'science',
    health: 'health',
    sports: 'sports',
    entertainment: 'entertainment',
  };
  return mapping[category] ?? 'world';
}

function transformGNewsArticle(
  article: GNewsArticle,
  requestedCategory?: string
): Article {
  return {
    id: `gnews-${btoa(article.url).slice(0, 20)}`,
    title: article.title,
    description: article.description,
    content: article.content,
    author: undefined, // GNews does not provide author info
    source: {
      id: article.source.name.toLowerCase().replace(/\s+/g, '-'),
      name: article.source.name,
      provider: 'gnews',
    },
    category: requestedCategory ?? 'general',
    publishedAt: article.publishedAt,
    imageUrl: article.image,
    url: article.url,
  };
}
