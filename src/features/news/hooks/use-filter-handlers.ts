import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type { NewsSource, SearchFilters } from '../types';

/**
 * Headless hook for managing filter panel state.
 * Separates filter logic from UI presentation.
 */
export function useFilterHandlers(
  filters: SearchFilters,
  onFiltersChange: (filters: SearchFilters) => void
) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleCategoryChange = useCallback(
    (category: string) => {
      onFiltersChange({
        ...filters,
        category: filters.category === category ? undefined : category,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSourceToggle = useCallback(
    (source: NewsSource) => {
      const currentSources = filters.sources ?? [];
      const newSources = currentSources.includes(source)
        ? currentSources.filter((s) => s !== source)
        : [...currentSources, source];
      onFiltersChange({
        ...filters,
        sources: newSources.length > 0 ? newSources : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      onFiltersChange({
        ...filters,
        dateFrom: range?.from?.toISOString().split('T')[0],
        dateTo: range?.to?.toISOString().split('T')[0],
      });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({ keyword: filters.keyword });
  }, [filters.keyword, onFiltersChange]);

  const hasActiveFilters =
    !!filters.category ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    (filters.sources && filters.sources.length > 0);

  const selectedDateRange: DateRange | undefined = useMemo(
    () =>
      filters.dateFrom || filters.dateTo
        ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined,
        }
        : undefined,
    [filters.dateFrom, filters.dateTo]
  );

  return {
    handlers: {
      handleCategoryChange,
      handleSourceToggle,
      handleDateRangeChange,
      clearFilters,
      toggleOpen,
    },
    computed: {
      hasActiveFilters,
      selectedDateRange,
    },
    state: {
      isOpen,
    },
  };
}
