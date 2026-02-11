import axios from 'axios';
import { env } from '@/config/env';
import type { AdapterResult, Article, SearchFilters } from '../types';
import { generateArticleId } from './article-utils';
import { mapCategoryToNYTimesSection } from './category-mapper';

interface NYTimesHeadline {
  main: string;
  kicker: string | null;
  print_headline: string | null;
}

interface NYTimesByline {
  original: string | null;
  person: { firstname: string; lastname: string }[];
}

interface NYTimesMultimediaItem {
  url: string;
  type: string;
  subtype: string;
}

interface NYTimesMultimediaObject {
  default?: { url: string; height: number; width: number };
  thumbnail?: { url: string; height: number; width: number };
  caption?: string;
  credit?: string;
}

interface NYTimesDoc {
  _id: string;
  headline: NYTimesHeadline;
  abstract: string;
  lead_paragraph: string;
  byline: NYTimesByline;
  section_name: string;
  pub_date: string;
  multimedia: NYTimesMultimediaItem[] | NYTimesMultimediaObject | null;
  web_url: string;
}

interface NYTimesResponse {
  status: string;
  response: {
    docs: NYTimesDoc[] | null;
  };
}

const BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
// NYTimes API returns 10 docs per page (fixed by the API)
const NYTIMES_PAGE_SIZE = 10;

function formatDateForNYT(dateString: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateString.replace(/-/g, '');
}

export async function fetchFromNYTimes(
  filters: SearchFilters,
  page: number = 1,
): Promise<AdapterResult> {
  const apiKey = env.NYTIMES_KEY;
  if (!apiKey) {
    console.warn('NY Times API key not configured');
    return { articles: [], hasMore: false };
  }


  const nytPage = Math.min(page - 1, 200);

  const params = new URLSearchParams({
    'api-key': apiKey,
    page: String(nytPage),
  });

  if (filters.keyword) {
    params.set('q', filters.keyword);
  }

  if (filters.dateFrom) {
    params.set('begin_date', formatDateForNYT(filters.dateFrom));
  }

  if (filters.dateTo) {
    params.set('end_date', formatDateForNYT(filters.dateTo));
  }

  const fqConditions: string[] = [];

  const categoriesToFilter = filters.categories ?? (filters.category ? [filters.category] : []);
  if (categoriesToFilter.length > 0) {
    const sections = categoriesToFilter.map((cat) => `"${mapCategoryToNYTimesSection(cat)}"`);
    fqConditions.push(`section.name:(${sections.join(' ')})`);
  }

  if (fqConditions.length > 0) {
    params.set('fq', fqConditions.join(' AND '));
  }

  try {
    const response = await axios.get<NYTimesResponse>(`${BASE_URL}?${params}`);
    const docs = response.data.response.docs ?? [];
    const transformedArticles = docs.map((doc) =>
      transformNYTimesDoc(doc, filters.category)
    );

    const hasMore = docs.length === NYTIMES_PAGE_SIZE && nytPage < 200;

    return {
      articles: transformedArticles,
      hasMore,
    };
  } catch (error) {
    console.error('NY Times API fetch error:', error);
    return { articles: [], hasMore: false };
  }
}

function transformNYTimesDoc(
  doc: NYTimesDoc,
  requestedCategory?: string
): Article {
  let author;
  if (doc.byline?.original) {
    author = doc.byline.original.replace(/^By\s+/i, '');
  } else if (doc.byline?.person?.length > 0) {
    const person = doc.byline.person[0];
    author = `${person.firstname} ${person.lastname}`;
  }

  let imageUrl: string | null = null;
  if (Array.isArray(doc.multimedia)) {
    const image = doc.multimedia.find(
      (m) => m.type === 'image' && m.subtype === 'xlarge'
    );
    if (image?.url) {
      imageUrl = `https://www.nytimes.com/${image.url}`;
    }
  } else if (doc.multimedia && typeof doc.multimedia === 'object') {
    const url = doc.multimedia.default?.url ?? doc.multimedia.thumbnail?.url;
    if (url) {
      imageUrl = url;
    }
  }

  return {
    id: generateArticleId('nytimes', doc._id),
    title: doc.headline.main,
    description: doc.abstract,
    content: doc.lead_paragraph,
    author,
    source: {
      id: 'nytimes',
      name: 'The New York Times',
      provider: 'nytimes',
    },
    category: requestedCategory ?? doc.section_name?.toLowerCase() ?? 'general',
    publishedAt: doc.pub_date,
    imageUrl,
    url: doc.web_url,
  };
}
