import { ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CATEGORIES, NEWS_SOURCES, type SearchFilters } from '../types';
import { useFilterHandlers } from '../hooks';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const { handlers, computed, state } = useFilterHandlers(filters, onFiltersChange);
  const {
    handleCategoryChange,
    handleSourceToggle,
    handleDateRangeChange,
    clearFilters,
    toggleOpen,
  } = handlers;
  const { hasActiveFilters, selectedDateRange } = computed;
  const { isOpen } = state;

  return (
    <div className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="size-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'size-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="xs" onClick={clearFilters}>
                <X className="size-3" />
                Clear all
              </Button>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={filters.category === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-2">
            <Label>Sources</Label>
            <div className="flex flex-wrap gap-2">
              {NEWS_SOURCES.map((source) => (
                <Badge
                  key={source.id}
                  variant={
                    filters.sources?.includes(source.id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleSourceToggle(source.id)}
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Calendar
              mode="range"
              selected={selectedDateRange}
              onSelect={handleDateRangeChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
