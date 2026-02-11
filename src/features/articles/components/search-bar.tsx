import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/lib/use-debounced-value';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search articles...',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebouncedValue(localValue, 300);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue === value) {
      return
    }
    onChange(debouncedValue);
  }, [debouncedValue, value, onChange]);

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
  );
}
