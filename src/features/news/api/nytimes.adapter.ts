import axios from 'axios';
import { env } from '@/config/env';
import type { Article, SearchFilters } from '../types';
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

function formatDateForNYT(dateString: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateString.replace(/-/g, '');
}

export async function fetchFromNYTimes(
  filters: SearchFilters
): Promise<Article[]> {
  const apiKey = env.NYTIMES_KEY;
  if (!apiKey) {
    console.warn('NY Times API key not configured');
    return [];
  }

  const params = new URLSearchParams({
    'api-key': apiKey,
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

  // Build filter query conditions (combined with AND)
  const fqConditions: string[] = [];

  // Handle multiple categories (OR) or single category
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
    return (response.data.response.docs ?? []).map((doc) =>
      transformNYTimesDoc(doc, filters.category)
    );
  } catch (error) {
    console.error('NY Times API fetch error:', error);
    return [];
  }
}

function transformNYTimesDoc(
  doc: NYTimesDoc,
  requestedCategory?: string
): Article {
  // Extract author from byline
  let author;
  if (doc.byline?.original) {
    author = doc.byline.original.replace(/^By\s+/i, '');
  } else if (doc.byline?.person?.length > 0) {
    const person = doc.byline.person[0];
    author = `${person.firstname} ${person.lastname}`;
  }

  // Find image URL from multimedia
  let imageUrl: string | null = null;
  if (Array.isArray(doc.multimedia)) {
    // Handle array format
    const image = doc.multimedia.find(
      (m) => m.type === 'image' && m.subtype === 'xlarge'
    );
    if (image?.url) {
      imageUrl = `https://www.nytimes.com/${image.url}`;
    }
  } else if (doc.multimedia && typeof doc.multimedia === 'object') {
    // Handle object format with default/thumbnail properties
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
