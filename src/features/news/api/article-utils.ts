import type { Article } from '../types';


export function generateArticleId(provider: string, url: string): string {
  return `${provider}-${btoa(url)}`;
}


export function deduplicateArticles(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });
}


export function sortByDate(articles: Article[]): Article[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}


export function filterBySourceNames(
  articles: Article[],
  sourceNames: string[]
): Article[] {
  if (sourceNames.length === 0) {
    return articles;
  }

  const lowerSourceNames = sourceNames.map((name) => name.toLowerCase());

  return articles.filter((article) => {
    const articleSourceName = article.source.name.toLowerCase();
    return lowerSourceNames.some(
      (preferredName) =>
        articleSourceName.includes(preferredName) ||
        preferredName.includes(articleSourceName)
    );
  });
}


export function filterByCategories(
  articles: Article[],
  categories: string[]
): Article[] {
  if (categories.length === 0) {
    return articles;
  }

  const lowerCategories = categories.map((c) => c.toLowerCase());

  return articles.filter((article) =>
    lowerCategories.includes(article.category.toLowerCase())
  );
}
