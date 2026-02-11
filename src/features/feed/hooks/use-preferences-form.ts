import { useState, useCallback } from 'react';
import type { NewsSource } from '@/features/shared/news';
import { DEFAULT_PREFERENCES, type UserPreferences } from '../types';

export function usePreferencesForm(initialPreferences: UserPreferences) {
  const [draft, setDraft] = useState<UserPreferences>(initialPreferences);
  const [authorInput, setAuthorInput] = useState('');

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

  const handleAddAuthor = useCallback(() => {
    const trimmed = authorInput.trim();
    if (trimmed && !draft.preferredAuthors.includes(trimmed)) {
      setDraft((prev) => ({
        ...prev,
        preferredAuthors: [...prev.preferredAuthors, trimmed],
      }));
      setAuthorInput('');
    }
  }, [authorInput, draft.preferredAuthors]);

  const handleRemoveAuthor = useCallback((author: string) => {
    setDraft((prev) => ({
      ...prev,
      preferredAuthors: prev.preferredAuthors.filter((a) => a !== author),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setDraft(DEFAULT_PREFERENCES);
    setAuthorInput('');
  }, []);

  const resetToDraft = useCallback((preferences: UserPreferences) => {
    setDraft(preferences);
    setAuthorInput('');
  }, []);

  return {
    draft,
    authorInput,
    setAuthorInput,
    handlers: {
      handleSourceToggle,
      handleCategoryToggle,
      handleAddAuthor,
      handleRemoveAuthor,
      handleReset,
      resetToDraft,
    },
    computed: {
      hasChanges: JSON.stringify(draft) !== JSON.stringify(initialPreferences),
      hasAuthor: authorInput.trim().length > 0,
    },
  };
}
