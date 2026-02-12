import type { GNewsResponse, NewsAPIResponse } from '@/features/shared/news';
import type { Article, NewsSource } from '@/features/shared/news/types';

let articleIdCounter = 0;

interface CreateMockArticleOptions {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  author?: string;
  sourceName?: string;
  provider?: NewsSource;
  category?: string;
  publishedAt?: string;
  imageUrl?: string | null;
  url?: string;
}

export function createMockArticle(
  options: CreateMockArticleOptions = {}
): Article {
  articleIdCounter += 1;
  const id = options.id ?? `article-${articleIdCounter}`;
  const provider = options.provider ?? 'newsapi';

  return {
    id,
    title: options.title ?? `Test Article ${articleIdCounter}`,
    description:
      options.description ?? `Description for article ${articleIdCounter}`,
    content: options.content ?? `Full content for article ${articleIdCounter}`,
    author: options.author ?? 'Test Author',
    source: {
      id: `source-${provider}`,
      name: options.sourceName ?? `Source from ${provider}`,
      provider,
    },
    category: options.category ?? 'general',
    publishedAt: options.publishedAt ?? new Date().toISOString(),
    imageUrl: options.imageUrl ?? `https://example.com/image-${id}.jpg`,
    url: options.url ?? `https://example.com/article/${id}`,
  };
}

export function createMockArticles(
  count: number,
  options: CreateMockArticleOptions = {}
): Article[] {
  return Array.from({ length: count }, (_, i) =>
    createMockArticle({
      ...options,
      title: options.title ?? `Test Article ${i + 1}`,
    })
  );
}


export function createNewsAPIResponse(
  articles: Article[],
  totalResults?: number
): NewsAPIResponse {
  return {
    status: 'ok',
    totalResults: totalResults ?? articles.length,
    articles: articles.map((article) => ({
      source: { id: article.source.id, name: article.source.name },
      author: article.author ?? null,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.imageUrl,
      publishedAt: article.publishedAt,
      content: article.content,
    })),
  };
}



export function createGNewsResponse(
  articles: Article[],
  totalArticles?: number
): GNewsResponse {
  return {
    totalArticles: totalArticles ?? articles.length,
    articles: articles.map((article) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.imageUrl,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: `https://${article.source.name.toLowerCase().replace(/\s/g, '')}.com`,
      },
    })),
  };
}

// NYTimes response format
export interface NYTimesResponse {
  status: string;
  response: {
    docs: Array<{
      _id: string;
      headline: { main: string; kicker: string | null; print_headline: string | null };
      abstract: string;
      lead_paragraph: string;
      byline: { original: string | null; person: { firstname: string; lastname: string }[] };
      section_name: string;
      pub_date: string;
      multimedia: Array<{ url: string; type: string; subtype: string }> | null;
      web_url: string;
    }> | null;
  };
}

export function createNYTimesResponse(
  articles: Article[]
): NYTimesResponse {
  return {
    status: 'OK',
    response: {
      docs: articles.map((article) => ({
        _id: article.id,
        headline: {
          main: article.title,
          kicker: null,
          print_headline: article.title,
        },
        abstract: article.description,
        lead_paragraph: article.content,
        byline: {
          original: article.author ? `By ${article.author}` : null,
          person: article.author
            ? [{ firstname: article.author.split(' ')[0], lastname: article.author.split(' ')[1] ?? '' }]
            : [],
        },
        section_name: article.category,
        pub_date: article.publishedAt,
        multimedia: article.imageUrl
          ? [{ url: article.imageUrl.replace('https://static01.nyt.com/', ''), type: 'image', subtype: 'photo' }]
          : null,
        web_url: article.url,
      })),
    },
  };
}

export function resetArticleIdCounter(): void {
  articleIdCounter = 0;
}
