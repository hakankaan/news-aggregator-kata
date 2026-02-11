import { useInfiniteQuery, infiniteQueryOptions } from '@tanstack/react-query';
import type { SearchFilters, PaginatedResult, Article } from '../types';
import { fetchArticles } from './aggregator';

export function searchArticlesInfiniteQueryOptions(
  filters: Omit<SearchFilters, 'page'>
) {
  return infiniteQueryOptions({
    queryKey: ['articles', 'search', 'infinite', filters] as const,
    queryFn: ({ pageParam }) => fetchArticles({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResult<Article>) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface UseInfiniteSearchArticlesOptions {
  filters: Omit<SearchFilters, 'page'>;
}

export function useInfiniteSearchArticles({
  filters,
}: UseInfiniteSearchArticlesOptions) {
  return useInfiniteQuery(searchArticlesInfiniteQueryOptions(filters));
}
