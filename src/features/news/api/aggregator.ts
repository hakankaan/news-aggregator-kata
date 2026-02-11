import type { Article, SearchFilters, UserPreferences, PaginatedResult } from '../types';
import { DEFAULT_PAGE_SIZE } from '../types';
import { adapterRegistry } from './adapter-registry';
import { deduplicateArticles, sortByDate, filterBySourceNames } from './article-utils';


export async function fetchArticles(filters: SearchFilters): Promise<PaginatedResult<Article>> {
  const enabledSources = filters.sources ?? adapterRegistry.getIds();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  const articles = await adapterRegistry.fetchFromSources(enabledSources, filters);

  const uniqueArticles = deduplicateArticles(articles);
  const sortedArticles = sortByDate(uniqueArticles);

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedArticles = sortedArticles.slice(startIndex, endIndex);

  return {
    items: paginatedArticles,
    totalCount: sortedArticles.length,
    page,
    pageSize,
    hasNextPage: endIndex < sortedArticles.length,
  };
}


export async function fetchPersonalizedFeed(
  preferences: UserPreferences,
  pagination?: { page?: number; pageSize?: number }
): Promise<PaginatedResult<Article>> {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;

  const filters: SearchFilters = {
    page,
    pageSize,
  };

  if (preferences.preferredSources.length > 0) {
    filters.sources = preferences.preferredSources;
  }

  if (preferences.preferredCategories.length > 0) {
    filters.categories = preferences.preferredCategories;
  }

  const result = await fetchArticles(filters);

  // Apply source name filtering if preferences exist
  if (preferences.preferredSourceNames.length > 0) {
    const filteredItems = filterBySourceNames(result.items, preferences.preferredSourceNames);
    return {
      ...result,
      items: filteredItems,
      totalCount: filteredItems.length,
    };
  }

  return result;
}

export function getArticleById(
  articles: Article[],
  id: string
): Article | undefined {
  return articles.find((article) => article.id === id);
}
