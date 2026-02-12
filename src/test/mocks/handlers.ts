import { http, HttpResponse, delay } from 'msw';
import {
  createMockArticles,
  createNewsAPIResponse,
  createGNewsResponse,
  createNYTimesResponse,
} from './fixtures';

const DEFAULT_PAGE_SIZE = 12;


export const handlers = [
  // NewsAPI handlers
  http.get('https://newsapi.org/v2/everything', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10);

    const totalResults = 30;
    const articles = createMockArticles(Math.min(pageSize, totalResults - (page - 1) * pageSize), {
      provider: 'newsapi',
    });

    return HttpResponse.json(createNewsAPIResponse(articles, totalResults));
  }),

  http.get('https://newsapi.org/v2/top-headlines', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10);
    const category = url.searchParams.get('category');

    const totalResults = 24;
    const articles = createMockArticles(Math.min(pageSize, totalResults - (page - 1) * pageSize), {
      provider: 'newsapi',
      category: category ?? 'general',
    });

    return HttpResponse.json(createNewsAPIResponse(articles, totalResults));
  }),

  // GNews handlers
  http.get('https://gnews.io/api/v4/search', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const max = parseInt(url.searchParams.get('max') ?? '10', 10);
    const topic = url.searchParams.get('topic');

    const totalArticles = 25;
    const articles = createMockArticles(Math.min(max, totalArticles - (page - 1) * max), {
      provider: 'gnews',
      category: topic ?? 'general',
    });

    return HttpResponse.json(createGNewsResponse(articles, totalArticles));
  }),

  http.get('https://gnews.io/api/v4/top-headlines', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const max = parseInt(url.searchParams.get('max') ?? '10', 10);
    const topic = url.searchParams.get('topic');

    const totalArticles = 20;
    const articles = createMockArticles(Math.min(max, totalArticles - (page - 1) * max), {
      provider: 'gnews',
      category: topic ?? 'general',
    });

    return HttpResponse.json(createGNewsResponse(articles, totalArticles));
  }),

  // NYTimes handler
  http.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const fq = url.searchParams.get('fq');

    // Extract category from fq if present
    let category = 'general';
    if (fq) {
      const match = fq.match(/section\.name:\("([^"]+)"\)/);
      if (match) {
        category = match[1].toLowerCase();
      }
    }

    // NYTimes returns 10 docs per page (fixed)
    const articles = createMockArticles(10, {
      provider: 'nytimes',
      category,
    });

    return HttpResponse.json(createNYTimesResponse(articles));
  }),
];

// Helper handlers for specific test scenarios
export const emptyResponseHandlers = [
  http.get('https://newsapi.org/v2/*', () => {
    return HttpResponse.json(createNewsAPIResponse([], 0));
  }),
  http.get('https://gnews.io/api/v4/*', () => {
    return HttpResponse.json(createGNewsResponse([], 0));
  }),
  http.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', () => {
    return HttpResponse.json(createNYTimesResponse([]));
  }),
];

export const errorResponseHandlers = [
  http.get('https://newsapi.org/v2/*', () => {
    return HttpResponse.json(
      { status: 'error', code: 'apiKeyInvalid', message: 'API key invalid' },
      { status: 401 }
    );
  }),
  http.get('https://gnews.io/api/v4/*', () => {
    return HttpResponse.json(
      { errors: ['Invalid API key'] },
      { status: 403 }
    );
  }),
  http.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', () => {
    return HttpResponse.json(
      { status: 'ERROR', errors: ['Invalid API key'] },
      { status: 403 }
    );
  }),
];

export const networkErrorHandlers = [
  http.get('https://newsapi.org/v2/*', () => {
    return HttpResponse.error();
  }),
  http.get('https://gnews.io/api/v4/*', () => {
    return HttpResponse.error();
  }),
  http.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', () => {
    return HttpResponse.error();
  }),
];
