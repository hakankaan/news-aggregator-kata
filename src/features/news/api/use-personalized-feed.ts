import { useInfiniteQuery, infiniteQueryOptions } from '@tanstack/react-query';
import type { UserPreferences, Article, PaginatedResult } from '../types';
import { fetchPersonalizedFeed } from './aggregator';

export function personalizedFeedInfiniteQueryOptions(preferences: UserPreferences) {
  return infiniteQueryOptions({
    queryKey: ['articles', 'personalized', 'infinite', preferences] as const,
    queryFn: ({ pageParam }) => fetchPersonalizedFeed(preferences, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResult<Article>) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface UseInfinitePersonalizedFeedOptions {
  preferences: UserPreferences;
}

export function useInfinitePersonalizedFeed({
  preferences,
}: UseInfinitePersonalizedFeedOptions) {
  return useInfiniteQuery(personalizedFeedInfiniteQueryOptions(preferences));
}
