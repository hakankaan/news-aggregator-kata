import type { AdapterResult, NewsSource } from '../types';
import { fetchFromNewsAPI, type SearchFilters } from './news-api.adapter';
import { fetchFromGNews } from './gnews.adapter';
import { fetchFromNYTimes } from './nytimes.adapter';


export interface NewsAdapter {
  readonly id: NewsSource;
  readonly name: string;
  fetch: (filters: SearchFilters, page: number, pageSize: number) => Promise<AdapterResult>;
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
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Map<NewsSource, AdapterResult>> {
    const enabledAdapters = sourceIds
      .map((id) => this.adapters.get(id))
      .filter((adapter): adapter is NewsAdapter => adapter !== undefined);

    const results = await Promise.allSettled(
      enabledAdapters.map((adapter) =>
        adapter.fetch(filters, page, pageSize).then(result => ({
          id: adapter.id,
          result,
        }))
      )
    );

    const resultMap = new Map<NewsSource, AdapterResult>();
    for (const result of results) {
      if (result.status === 'fulfilled') {
        resultMap.set(result.value.id, result.value.result);
      }
    }

    return resultMap;
  }
}

export const adapterRegistry = new AdapterRegistry();

adapterRegistry.register({
  id: 'newsapi',
  name: 'NewsAPI',
  fetch: (filters, page, pageSize) => fetchFromNewsAPI(filters, page, pageSize),
});

adapterRegistry.register({
  id: 'gnews',
  name: 'GNews',
  fetch: (filters, page, pageSize) => fetchFromGNews(filters, page, pageSize),
});

adapterRegistry.register({
  id: 'nytimes',
  name: 'NY Times',
  fetch: (filters, page) => fetchFromNYTimes(filters, page),
});
