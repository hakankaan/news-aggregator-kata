import axios from 'axios';
import { env } from '@/config/env';
import type { AdapterResult, Article } from '../types';
import { generateArticleId } from './article-utils';
import { mapCategoryToGNewsTopic } from './category-mapper';
import type { SearchFilters } from './news-api.adapter';


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

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

const BASE_URL = 'https://gnews.io/api/v4';


export async function fetchFromGNews(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<AdapterResult> {
  const apiKey = env.GNEWS_KEY;
  if (!apiKey) {
    console.warn('GNews key not configured');
    return { articles: [], hasMore: false };
  }

  // GNews max is capped at 100
  const clampedPageSize = Math.min(pageSize, 100);

  const params = new URLSearchParams({
    apikey: apiKey,
    lang: 'en',
    max: String(clampedPageSize),
    page: String(page),
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

  const category = filters.categories?.[0] ?? filters.category;
  if (category) {
    params.set('topic', mapCategoryToGNewsTopic(category));
  }

  try {
    const response = await axios.get<GNewsResponse>(`${BASE_URL}${endpoint}?${params}`);
    const { totalArticles, articles } = response.data;
    const transformedArticles = articles.map((article) =>
      transformGNewsArticle(article, category)
    );

    const fetchedSoFar = page * clampedPageSize;
    const hasMore = fetchedSoFar < totalArticles;

    return {
      articles: transformedArticles,
      totalResults: totalArticles,
      hasMore,
    };
  } catch (error) {
    console.error('GNews fetch error:', error);
    return { articles: [], hasMore: false };
  }
}

function transformGNewsArticle(
  article: GNewsArticle,
  requestedCategory?: string
): Article {
  return {
    id: generateArticleId('gnews', article.url),
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
