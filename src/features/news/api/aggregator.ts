import type { Article, SearchFilters, UserPreferences } from '../types';
import { fetchFromNewsAPI } from './news-api.adapter';
import { fetchFromGNews } from './gnews.adapter';
import { fetchFromNYTimes } from './nytimes.adapter';

export async function fetchArticles(filters: SearchFilters): Promise<Article[]> {
  const enabledSources = filters.sources ?? ['newsapi', 'gnews', 'nytimes'];

  const fetchPromises: Promise<Article[]>[] = [];

  if (enabledSources.includes('newsapi')) {
    fetchPromises.push(fetchFromNewsAPI(filters));
  }

  if (enabledSources.includes('gnews')) {
    fetchPromises.push(fetchFromGNews(filters));
  }

  if (enabledSources.includes('nytimes')) {
    fetchPromises.push(fetchFromNYTimes(filters));
  }

  const results = await Promise.allSettled(fetchPromises);

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const uniqueArticles = articles.filter((article) => {
    if (seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });

  // Sort by published date (newest first)
  return uniqueArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function fetchPersonalizedFeed(
  preferences: UserPreferences
): Promise<Article[]> {
  const filters: SearchFilters = {};

  // If user has preferred sources, only fetch from those
  if (preferences.preferredSources.length > 0) {
    filters.sources = preferences.preferredSources;
  }

  // If user has preferred categories, use the first one as filter
  if (preferences.preferredCategories.length > 0) {
    filters.category = preferences.preferredCategories[0];
  }

  const articles = await fetchArticles(filters);

  // Filter by preferred source names if specified
  if (preferences.preferredSourceNames.length > 0) {
    const sourceNameSet = new Set(
      preferences.preferredSourceNames.map((s) => s.toLowerCase())
    );
    return articles.filter((article) =>
      sourceNameSet.has(article.source.name.toLowerCase())
    );
  }

  return articles;
}

export function getArticleById(
  articles: Article[],
  id: string
): Article | undefined {
  return articles.find((article) => article.id === id);
}
