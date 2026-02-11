import type { NewsSource } from '@/features/shared/news';

export interface SearchFilters {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  categories?: string[];
  sources?: NewsSource[];
  page?: number;
  pageSize?: number;
}
