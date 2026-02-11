import { env } from '@/config/env';
import type { Article, SearchFilters } from '../types';

interface NYTimesHeadline {
  main: string;
  kicker: string | null;
  print_headline: string | null;
}

interface NYTimesByline {
  original: string | null;
  person: { firstname: string; lastname: string }[];
}

interface NYTimesMultimedia {
  url: string;
  type: string;
  subtype: string;
}

interface NYTimesDoc {
  _id: string;
  headline: NYTimesHeadline;
  abstract: string;
  lead_paragraph: string;
  byline: NYTimesByline;
  section_name: string;
  pub_date: string;
  multimedia: NYTimesMultimedia[];
  web_url: string;
}

interface NYTimesResponse {
  status: string;
  response: {
    docs: NYTimesDoc[];
  };
}

const BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

function formatDateForNYT(dateString: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateString.replace(/-/g, '');
}

function mapCategoryToSection(category: string): string {
  const mapping: Record<string, string> = {
    general: 'U.S.',
    business: 'Business',
    technology: 'Technology',
    science: 'Science',
    health: 'Health',
    sports: 'Sports',
    entertainment: 'Arts',
  };
  return mapping[category] ?? 'U.S.';
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

  if (filters.category) {
    const section = mapCategoryToSection(filters.category);
    params.set('fq', `section_name:("${section}")`);
  }

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`NY Times API error: ${response.status}`);
    }

    const data: NYTimesResponse = await response.json();
    return data.response.docs.map((doc) =>
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
  const image = doc.multimedia?.find(
    (m) => m.type === 'image' && m.subtype === 'xlarge'
  );
  if (image?.url) {
    imageUrl = `https://www.nytimes.com/${image.url}`;
  }

  return {
    id: `nytimes-${btoa(doc._id).slice(0, 20)}`,
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
