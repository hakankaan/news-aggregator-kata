import { useState, useCallback } from 'react';
import { DEFAULT_PREFERENCES, type NewsSource, type UserPreferences } from '../types';

export function usePreferencesForm(initialPreferences: UserPreferences) {
  const [draft, setDraft] = useState<UserPreferences>(initialPreferences);
  const [sourceNameInput, setSourceNameInput] = useState('');

  const handleSourceToggle = useCallback((source: NewsSource) => {
    setDraft((prev) => ({
      ...prev,
      preferredSources: prev.preferredSources.includes(source)
        ? prev.preferredSources.filter((s) => s !== source)
        : [...prev.preferredSources, source],
    }));
  }, []);

  const handleCategoryToggle = useCallback((category: string) => {
    setDraft((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter((c) => c !== category)
        : [...prev.preferredCategories, category],
    }));
  }, []);

  const handleAddSourceName = useCallback(() => {
    const trimmed = sourceNameInput.trim();
    if (trimmed && !draft.preferredSourceNames.includes(trimmed)) {
      setDraft((prev) => ({
        ...prev,
        preferredSourceNames: [...prev.preferredSourceNames, trimmed],
      }));
      setSourceNameInput('');
    }
  }, [sourceNameInput, draft.preferredSourceNames]);

  const handleRemoveSourceName = useCallback((sourceName: string) => {
    setDraft((prev) => ({
      ...prev,
      preferredSourceNames: prev.preferredSourceNames.filter((s) => s !== sourceName),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setDraft(DEFAULT_PREFERENCES);
    setSourceNameInput('');
  }, []);

  const resetToDraft = useCallback((preferences: UserPreferences) => {
    setDraft(preferences);
    setSourceNameInput('');
  }, []);

  return {
    draft,
    sourceNameInput,
    setSourceNameInput,
    handlers: {
      handleSourceToggle,
      handleCategoryToggle,
      handleAddSourceName,
      handleRemoveSourceName,
      handleReset,
      resetToDraft,
    },
    computed: {
      hasChanges: JSON.stringify(draft) !== JSON.stringify(initialPreferences),
      hasSourceName: sourceNameInput.trim().length > 0,
    },
  };
}
