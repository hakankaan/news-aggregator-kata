import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, type NewsSource, type SearchFilters } from '../types';

const NEWS_SOURCES: { id: NewsSource; name: string }[] = [
  { id: 'newsapi', name: 'NewsAPI' },
  { id: 'gnews', name: 'GNews' },
  { id: 'nytimes', name: 'NY Times' },
];

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handleSourceToggle = (source: NewsSource) => {
    const currentSources = filters.sources ?? [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter((s) => s !== source)
      : [...currentSources, source];
    onFiltersChange({
      ...filters,
      sources: newSources.length > 0 ? newSources : undefined,
    });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({ keyword: filters.keyword });
  };

  const hasActiveFilters =
    filters.category ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.sources && filters.sources.length > 0);

  return (
    <div className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4" />
          <span className="font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="xs" onClick={clearFilters}>
            <X className="size-3" />
            Clear all
          </Button>
        )}
      </div>

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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Calendar className="size-3" />
            From
          </Label>
          <Input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Calendar className="size-3" />
            To
          </Label>
          <Input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
