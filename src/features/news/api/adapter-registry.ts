import type { Article, NewsSource, SearchFilters } from '../types';
import { fetchFromNewsAPI } from './news-api.adapter';
import { fetchFromGNews } from './gnews.adapter';
import { fetchFromNYTimes } from './nytimes.adapter';


export interface NewsAdapter {
  readonly id: NewsSource;
  readonly name: string;
  fetch: (filters: SearchFilters) => Promise<Article[]>;
}


export class AdapterRegistry {
  private adapters: Map<NewsSource, NewsAdapter> = new Map();

  register(adapter: NewsAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  get(id: NewsSource): NewsAdapter | undefined {
    return this.adapters.get(id);
  }

  getAll(): NewsAdapter[] {
    return Array.from(this.adapters.values());
  }

  getIds(): NewsSource[] {
    return Array.from(this.adapters.keys());
  }

  async fetchFromSources(
    sourceIds: NewsSource[],
    filters: SearchFilters
  ): Promise<Article[]> {
    const enabledAdapters = sourceIds
      .map((id) => this.adapters.get(id))
      .filter((adapter): adapter is NewsAdapter => adapter !== undefined);

    const results = await Promise.allSettled(
      enabledAdapters.map((adapter) => adapter.fetch(filters))
    );

    const articles: Article[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    }

    return articles;
  }
}

export const adapterRegistry = new AdapterRegistry();

adapterRegistry.register({
  id: 'newsapi',
  name: 'NewsAPI',
  fetch: fetchFromNewsAPI,
});

adapterRegistry.register({
  id: 'gnews',
  name: 'GNews',
  fetch: fetchFromGNews,
});

adapterRegistry.register({
  id: 'nytimes',
  name: 'NY Times',
  fetch: fetchFromNYTimes,
});
