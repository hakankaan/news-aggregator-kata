import { Settings, X, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CATEGORIES, DEFAULT_PREFERENCES, type NewsSource, type UserPreferences } from '../types';
import { usePreferences } from '../stores/use-preferences';

const NEWS_SOURCES: { id: NewsSource; name: string }[] = [
  { id: 'newsapi', name: 'NewsAPI' },
  { id: 'gnews', name: 'GNews' },
  { id: 'nytimes', name: 'NY Times' },
];

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesPanel({ isOpen, onClose }: PreferencesPanelProps) {
  if (!isOpen) return null;
  return <PreferencesPanelContent onClose={onClose} />;
}

function PreferencesPanelContent({ onClose }: { onClose: () => void }) {
  const {
    preferences,
    savePreferences,
  } = usePreferences();

  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [sourceNameInput, setSourceNameInput] = useState('');

  const handleSourceToggle = (source: NewsSource) => {
    setDraft((prev) => ({
      ...prev,
      preferredSources: prev.preferredSources.includes(source)
        ? prev.preferredSources.filter((s) => s !== source)
        : [...prev.preferredSources, source],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setDraft((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter((c) => c !== category)
        : [...prev.preferredCategories, category],
    }));
  };

  const handleAddSourceName = () => {
    const trimmed = sourceNameInput.trim();
    if (trimmed && !draft.preferredSourceNames.includes(trimmed)) {
      setDraft((prev) => ({
        ...prev,
        preferredSourceNames: [...prev.preferredSourceNames, trimmed],
      }));
      setSourceNameInput('');
    }
  };

  const handleRemoveSourceName = (sourceName: string) => {
    setDraft((prev) => ({
      ...prev,
      preferredSourceNames: prev.preferredSourceNames.filter((s) => s !== sourceName),
    }));
  };

  const handleReset = () => {
    setDraft(DEFAULT_PREFERENCES);
  };

  const handleDone = () => {
    savePreferences(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background m-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="size-5" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Preferred Sources */}
          <div className="space-y-2">
            <Label>Preferred Sources</Label>
            <p className="text-muted-foreground text-sm">
              Select sources to prioritize in your feed
            </p>
            <div className="flex flex-wrap gap-2">
              {NEWS_SOURCES.map((source) => (
                <Badge
                  key={source.id}
                  variant={
                    draft.preferredSources.includes(source.id)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleSourceToggle(source.id)}
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Categories */}
          <div className="space-y-2">
            <Label>Preferred Categories</Label>
            <p className="text-muted-foreground text-sm">
              Select categories you're interested in
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={
                    draft.preferredCategories.includes(category)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Source Names */}
          <div className="space-y-2">
            <Label>Preferred Source Names</Label>
            <p className="text-muted-foreground text-sm">
              Add news outlets to follow (e.g., BBC, CNN, The New York Times)
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Source name"
                value={sourceNameInput}
                onChange={(e) => setSourceNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSourceName();
                  }
                }}
              />
              <Button onClick={handleAddSourceName} variant="outline">
                Add
              </Button>
            </div>
            {draft.preferredSourceNames.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {draft.preferredSourceNames.map((sourceName) => (
                  <Badge
                    key={sourceName}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveSourceName(sourceName)}
                  >
                    {sourceName}
                    <X className="ml-1 size-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between border-t pt-4">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button onClick={handleDone}>Done</Button>
        </div>
      </div>
    </div>
  );
}
