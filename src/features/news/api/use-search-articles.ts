import { queryOptions, useQuery } from '@tanstack/react-query';
import type { SearchFilters } from '../types';
import { fetchArticles } from './aggregator';

export function searchArticlesQueryOptions(filters: SearchFilters) {
  return queryOptions({
    queryKey: ['articles', 'search', filters],
    queryFn: () => fetchArticles(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

type UseSearchArticlesOptions = {
  filters: SearchFilters;
  queryConfig?: Omit<ReturnType<typeof searchArticlesQueryOptions>, 'queryKey' | 'queryFn'>;
};

export function useSearchArticles({
  filters,
  queryConfig,
}: UseSearchArticlesOptions) {
  return useQuery({
    ...searchArticlesQueryOptions(filters),
    ...queryConfig,
  });
}
