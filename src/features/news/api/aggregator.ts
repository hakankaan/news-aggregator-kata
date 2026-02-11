import type {
  Article,
  SearchFilters,
  UserPreferences,
  PaginatedResult,
  AggregatorPaginationState,
  NewsSource,
} from '../types';
import { DEFAULT_PAGE_SIZE, NEWS_SOURCES } from '../types';
import { adapterRegistry } from './adapter-registry';
import { deduplicateArticles, sortByDate, filterByAuthors } from './article-utils';

export function createInitialPaginationState(): AggregatorPaginationState {
  return NEWS_SOURCES.reduce((acc, source) => {
    acc[source.id] = { page: 1, exhausted: false };
    return acc;
  }, {} as AggregatorPaginationState);
}

export interface AggregatedResult extends PaginatedResult<Article> {
  paginationState: AggregatorPaginationState;
}

export async function fetchArticles(
  filters: SearchFilters,
  paginationState: AggregatorPaginationState = createInitialPaginationState()
): Promise<AggregatedResult> {
  const enabledSources = filters.sources ?? adapterRegistry.getIds();
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  const activeSources = enabledSources.filter(
    (sourceId) => !paginationState[sourceId]?.exhausted
  );

  if (activeSources.length === 0) {
    // All sources exhausted
    return {
      items: [],
      totalCount: 0,
      page: filters.page ?? 1,
      pageSize,
      hasNextPage: false,
      paginationState,
    };
  }

  const fetchPromises = activeSources.map(async (sourceId) => {
    const adapter = adapterRegistry.get(sourceId);
    if (!adapter) return { sourceId, result: { articles: [], hasMore: false } };

    const sourcePage = paginationState[sourceId]?.page ?? 1;
    const result = await adapter.fetch(filters, sourcePage, pageSize);
    return { sourceId, result };
  });

  const results = await Promise.allSettled(fetchPromises);

  const allArticles: Article[] = [];
  const newPaginationState = { ...paginationState };

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { sourceId, result: adapterResult } = result.value;
      allArticles.push(...adapterResult.articles);

      newPaginationState[sourceId] = {
        page: (paginationState[sourceId]?.page ?? 1) + 1,
        exhausted: !adapterResult.hasMore,
      };
    }
  }

  const uniqueArticles = deduplicateArticles(allArticles);
  const sortedArticles = sortByDate(uniqueArticles);

  const hasNextPage = Object.entries(newPaginationState).some(
    ([sourceId, state]) =>
      enabledSources.includes(sourceId as NewsSource) && !state.exhausted
  );

  return {
    items: sortedArticles,
    totalCount: sortedArticles.length,
    page: filters.page ?? 1,
    pageSize,
    hasNextPage,
    paginationState: newPaginationState,
  };
}


export async function fetchPersonalizedFeed(
  preferences: UserPreferences,
  pagination?: { page?: number; pageSize?: number },
  paginationState: AggregatorPaginationState = createInitialPaginationState()
): Promise<AggregatedResult> {
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

  const result = await fetchArticles(filters, paginationState);

  if (preferences.preferredAuthors.length > 0) {
    const filteredItems = filterByAuthors(result.items, preferences.preferredAuthors);
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
