export type NewsSource = 'newsapi' | 'gnews' | 'nytimes';

export const NEWS_SOURCES: { id: NewsSource; name: string }[] = [
  { id: 'newsapi', name: 'NewsAPI' },
  { id: 'gnews', name: 'GNews' },
  { id: 'nytimes', name: 'NY Times' },
] as const;

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  source: {
    id: string;
    name: string;
    provider: NewsSource;
  };
  category: string;
  publishedAt: string;
  imageUrl: string | null;
  url: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface AdapterResult {
  articles: Article[];
  totalResults?: number;
  hasMore: boolean;
}

export interface SourcePaginationState {
  page: number;
  exhausted: boolean;
}

export type AggregatorPaginationState = Record<NewsSource, SourcePaginationState>;

export const DEFAULT_PAGE_SIZE = 12;

export const CATEGORIES = [
  'general',
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
] as const;

export type Category = (typeof CATEGORIES)[number];
