
const GNEWS_TOPIC_MAP: Record<string, string> = {
  general: 'world',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

const NYTIMES_SECTION_MAP: Record<string, string> = {
  general: 'U.S.',
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Arts',
};

export function mapCategoryToGNewsTopic(category: string): string {
  return GNEWS_TOPIC_MAP[category] ?? 'world';
}

export function mapCategoryToNYTimesSection(category: string): string {
  return NYTIMES_SECTION_MAP[category] ?? 'U.S.';
}
