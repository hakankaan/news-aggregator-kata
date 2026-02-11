import type { NewsSource } from '@/features/shared/news';

export interface UserPreferences {
  preferredSources: NewsSource[];
  preferredCategories: string[];
  preferredAuthors: string[];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredSources: [],
  preferredCategories: [],
  preferredAuthors: [],
};
