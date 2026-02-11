export type NewsSource = 'newsapi' | 'gnews' | 'nytimes';

/** Available news sources with display names */
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

export interface SearchFilters {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  categories?: string[];
  sources?: NewsSource[];
  page?: number;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 12;

export interface UserPreferences {
  preferredSources: NewsSource[];
  preferredCategories: string[];
  preferredSourceNames: string[];
}

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

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredSources: [],
  preferredCategories: [],
  preferredSourceNames: [],
};
