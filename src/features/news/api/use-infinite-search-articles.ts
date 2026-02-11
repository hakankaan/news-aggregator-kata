import { useInfiniteQuery, infiniteQueryOptions } from '@tanstack/react-query';
import type { SearchFilters, AggregatorPaginationState } from '../types';
import { fetchArticles, createInitialPaginationState, type AggregatedResult } from './aggregator';

export function searchArticlesInfiniteQueryOptions(
  filters: Omit<SearchFilters, 'page'>
) {
  return infiniteQueryOptions({
    queryKey: ['articles', 'search', 'infinite', filters] as const,
    queryFn: ({ pageParam }) => fetchArticles({ ...filters }, pageParam),
    initialPageParam: createInitialPaginationState(),
    getNextPageParam: (lastPage: AggregatedResult): AggregatorPaginationState | undefined =>
      lastPage.hasNextPage ? lastPage.paginationState : undefined,
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
