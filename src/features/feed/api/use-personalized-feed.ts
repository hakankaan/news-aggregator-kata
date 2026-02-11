import { useInfiniteQuery, infiniteQueryOptions } from '@tanstack/react-query';
import type { UserPreferences } from '../types';
import {
  fetchPersonalizedFeed,
  createInitialPaginationState,
  type AggregatedResult,
  type AggregatorPaginationState,
} from '@/features/shared/news';

export function personalizedFeedInfiniteQueryOptions(preferences: UserPreferences) {
  return infiniteQueryOptions({
    queryKey: ['articles', 'personalized', 'infinite', preferences] as const,
    queryFn: ({ pageParam }) => fetchPersonalizedFeed(preferences, {}, pageParam),
    initialPageParam: createInitialPaginationState(),
    getNextPageParam: (lastPage: AggregatedResult): AggregatorPaginationState | undefined =>
      lastPage.hasNextPage ? lastPage.paginationState : undefined,
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
