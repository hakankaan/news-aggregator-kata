import { Spinner } from '@/components/ui/spinner';
import type { Article } from '../types';
import { ArticleCard } from './article-card';

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
}

export function ArticleList({
  articles,
  isLoading,
}: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
        />
      ))}
    </div>
  );
}
