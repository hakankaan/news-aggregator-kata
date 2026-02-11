import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, User } from 'lucide-react';
import type { Article } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
  });

  return (
    <Card className="h-full">
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-48 w-full bg-muted" />
      )}
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{article.source.name}</Badge>
          <Badge variant="outline">{article.category}</Badge>
          <Badge>{article.source.provider}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        <CardDescription>{timeAgo}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground line-clamp-3">
          {article.description}
        </p>
      </CardContent>
      <CardFooter className="justify-between gap-2 py-2">
        {article.author ? <span
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <User className="size-4" />
          <span className="truncate max-w-32">{article.author}</span>
        </span> : <div />}
        <Button asChild variant="outline" size="sm">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read more
            <ExternalLink className="size-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
