import { useState } from 'react';
import { useInfiniteSearchArticles } from '@/features/news/api/use-infinite-search-articles';
import type { SearchFilters } from '@/features/news/types';
import {
  InfiniteArticleList,
  SearchBar,
  FilterPanel,
} from '@/features/news/components';

const NewsRoute = () => {
  const [filters, setFilters] = useState<Omit<SearchFilters, 'page'>>({});

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteSearchArticles({ filters });

  const articles = data?.pages.flatMap((page) => page.items) ?? [];

  const handleKeywordChange = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword: keyword || undefined }));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Articles</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news from multiple sources
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={filters.keyword ?? ''}
          onChange={handleKeywordChange}
        />
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Articles with Infinite Scroll */}
      <InfiniteArticleList
        articles={articles}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        fetchNextPage={fetchNextPage}
        error={error}
      />
    </div>
  );
};

export default NewsRoute;
