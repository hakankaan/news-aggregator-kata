export type NewsSource = 'newsapi' | 'gnews' | 'nytimes';

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

export interface SearchFilters {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  sources?: NewsSource[];
}

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
