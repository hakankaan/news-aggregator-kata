import { useEffect, useRef, useCallback } from 'react';
import type { Article } from '../types';
import { ArticleCard } from './article-card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface InfiniteArticleListProps {
  articles: Article[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  error?: Error | null;
}

export function InfiniteArticleList({
  articles,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
}: InfiniteArticleListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">Failed to load articles</p>
        <Button variant="outline" onClick={() => fetchNextPage()}>
          Try again
        </Button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
        <p className="text-lg">No articles found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span className="text-muted-foreground text-sm">
              Loading more...
            </span>
          </div>
        ) : hasNextPage ? (
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load more articles
          </Button>
        ) : articles.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            No more articles to load
          </p>
        ) : null}
      </div>
    </div>
  );
}
