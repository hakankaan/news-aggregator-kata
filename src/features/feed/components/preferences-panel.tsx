import { Settings, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CATEGORIES, NEWS_SOURCES } from '@/features/shared/news';
import { usePreferences } from '../stores/use-preferences';
import { usePreferencesForm } from '../hooks';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesPanel({ isOpen, onClose }: PreferencesPanelProps) {
  const { preferences, savePreferences } = usePreferences();

  const {
    draft,
    authorInput,
    setAuthorInput,
    handlers: {
      handleSourceToggle,
      handleCategoryToggle,
      handleAddAuthor,
      handleRemoveAuthor,
      handleReset,
    },
  } = usePreferencesForm(preferences);

  const handleDone = () => {
    savePreferences(draft);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Preferences
          </DialogTitle>
        </DialogHeader>

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
                  asChild
                  variant={
                    draft.preferredSources.includes(source.id)
                      ? 'default'
                      : 'outline'
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    {source.name}
                  </button>
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
                  asChild
                  variant={
                    draft.preferredCategories.includes(category)
                      ? 'default'
                      : 'outline'
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Authors */}
          <div className="space-y-2">
            <Label>Preferred Authors</Label>
            <p className="text-muted-foreground text-sm">
              Add authors to follow (e.g., John Smith, Jane Doe)
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Author name"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAuthor();
                  }
                }}
              />
              <Button onClick={handleAddAuthor} variant="outline">
                Add
              </Button>
            </div>
            {draft.preferredAuthors.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {draft.preferredAuthors.map((author) => (
                  <Badge key={author} asChild variant="secondary">
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(author)}
                    >
                      {author}
                      <X className="ml-1 size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button onClick={handleDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
