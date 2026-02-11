import { queryOptions, useQuery } from '@tanstack/react-query';
import type { UserPreferences } from '../types';
import { fetchPersonalizedFeed } from './aggregator';

export function personalizedFeedQueryOptions(preferences: UserPreferences) {
  return queryOptions({
    queryKey: ['articles', 'personalized', preferences],
    queryFn: () => fetchPersonalizedFeed(preferences),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

type UsePersonalizedFeedOptions = {
  preferences: UserPreferences;
  queryConfig?: Omit<ReturnType<typeof personalizedFeedQueryOptions>, 'queryKey' | 'queryFn'>;
};

export function usePersonalizedFeed({
  preferences,
  queryConfig,
}: UsePersonalizedFeedOptions) {
  return useQuery({
    ...personalizedFeedQueryOptions(preferences),
    ...queryConfig,
  });
}
