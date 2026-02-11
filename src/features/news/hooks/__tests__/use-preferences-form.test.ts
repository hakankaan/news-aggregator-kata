import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferencesForm } from '../use-preferences-form';
import { DEFAULT_PREFERENCES, type NewsSource } from '../../types';

describe('usePreferencesForm', () => {
  it('should initialize with provided preferences', () => {
    const initial = {
      preferredSources: ['newsapi'] as NewsSource[],
      preferredCategories: ['technology'],
      preferredAuthors: ['John Smith'],
    };

    const { result } = renderHook(() =>
      usePreferencesForm({ ...DEFAULT_PREFERENCES, ...initial })
    );

    expect(result.current.draft.preferredSources).toContain('newsapi');
    expect(result.current.draft.preferredCategories).toContain('technology');
    expect(result.current.draft.preferredAuthors).toContain('John Smith');
  });

  it('should toggle source selection', () => {
    const { result } = renderHook(() => usePreferencesForm(DEFAULT_PREFERENCES));

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(result.current.draft.preferredSources).toContain('newsapi');

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(result.current.draft.preferredSources).not.toContain('newsapi');
  });

  it('should toggle category selection', () => {
    const { result } = renderHook(() => usePreferencesForm(DEFAULT_PREFERENCES));

    act(() => {
      result.current.handlers.handleCategoryToggle('technology');
    });

    expect(result.current.draft.preferredCategories).toContain('technology');

    act(() => {
      result.current.handlers.handleCategoryToggle('technology');
    });

    expect(result.current.draft.preferredCategories).not.toContain('technology');
  });

  it('should add author', () => {
    const { result } = renderHook(() => usePreferencesForm(DEFAULT_PREFERENCES));

    act(() => {
      result.current.setAuthorInput('John Smith');
    });

    act(() => {
      result.current.handlers.handleAddAuthor();
    });

    expect(result.current.draft.preferredAuthors).toContain('John Smith');
    expect(result.current.authorInput).toBe('');
  });

  it('should not add duplicate author', () => {
    const initial = {
      ...DEFAULT_PREFERENCES,
      preferredAuthors: ['John Smith'],
    };

    const { result } = renderHook(() => usePreferencesForm(initial));

    act(() => {
      result.current.setAuthorInput('John Smith');
    });

    act(() => {
      result.current.handlers.handleAddAuthor();
    });

    expect(result.current.draft.preferredAuthors).toHaveLength(1);
  });

  it('should remove author', () => {
    const initial = {
      ...DEFAULT_PREFERENCES,
      preferredAuthors: ['John Smith', 'Jane Doe'],
    };

    const { result } = renderHook(() => usePreferencesForm(initial));

    act(() => {
      result.current.handlers.handleRemoveAuthor('John Smith');
    });

    expect(result.current.draft.preferredAuthors).not.toContain('John Smith');
    expect(result.current.draft.preferredAuthors).toContain('Jane Doe');
  });

  it('should compute hasChanges correctly', () => {
    const { result } = renderHook(() => usePreferencesForm(DEFAULT_PREFERENCES));

    expect(result.current.computed.hasChanges).toBe(false);

    act(() => {
      result.current.handlers.handleSourceToggle('newsapi');
    });

    expect(result.current.computed.hasChanges).toBe(true);
  });

  it('should reset to defaults', () => {
    const initial = {
      preferredSources: ['newsapi'] as NewsSource[],
      preferredCategories: ['technology'],
      preferredAuthors: ['John Smith'],
    };

    const { result } = renderHook(() =>
      usePreferencesForm({ ...DEFAULT_PREFERENCES, ...initial })
    );

    act(() => {
      result.current.handlers.handleReset();
    });

    expect(result.current.draft).toEqual(DEFAULT_PREFERENCES);
  });
});
