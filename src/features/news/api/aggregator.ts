import type { Article, SearchFilters, UserPreferences } from '../types';
import { adapterRegistry } from './adapter-registry';
import { deduplicateArticles, sortByDate, filterBySourceNames } from './article-utils';


export async function fetchArticles(filters: SearchFilters): Promise<Article[]> {
  const enabledSources = filters.sources ?? adapterRegistry.getIds();

  const articles = await adapterRegistry.fetchFromSources(enabledSources, filters);

  const uniqueArticles = deduplicateArticles(articles);
  return sortByDate(uniqueArticles);
}


export async function fetchPersonalizedFeed(
  preferences: UserPreferences
): Promise<Article[]> {
  const filters: SearchFilters = {};

  if (preferences.preferredSources.length > 0) {
    filters.sources = preferences.preferredSources;
  }

  if (preferences.preferredCategories.length > 0) {
    filters.category = preferences.preferredCategories[0];
  }

  const articles = await fetchArticles(filters);

  return filterBySourceNames(articles, preferences.preferredSourceNames);
}

export function getArticleById(
  articles: Article[],
  id: string
): Article | undefined {
  return articles.find((article) => article.id === id);
}
