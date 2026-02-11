import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferencesForm } from '../use-preferences-form';
import { DEFAULT_PREFERENCES, type NewsSource } from '../../types';

describe('usePreferencesForm', () => {
  it('should initialize with provided preferences', () => {
    const initial = {
      preferredSources: ['newsapi'] as NewsSource[],
      preferredCategories: ['technology'],
      preferredSourceNames: ['BBC'],
    };

    const { result } = renderHook(() =>
      usePreferencesForm({ ...DEFAULT_PREFERENCES, ...initial })
    );

    expect(result.current.draft.preferredSources).toContain('newsapi');
    expect(result.current.draft.preferredCategories).toContain('technology');
    expect(result.current.draft.preferredSourceNames).toContain('BBC');
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

  it('should add source name', () => {
    const { result } = renderHook(() => usePreferencesForm(DEFAULT_PREFERENCES));

    act(() => {
      result.current.setSourceNameInput('BBC');
    });

    act(() => {
      result.current.handlers.handleAddSourceName();
    });

    expect(result.current.draft.preferredSourceNames).toContain('BBC');
    expect(result.current.sourceNameInput).toBe('');
  });

  it('should not add duplicate source name', () => {
    const initial = {
      ...DEFAULT_PREFERENCES,
      preferredSourceNames: ['BBC'],
    };

    const { result } = renderHook(() => usePreferencesForm(initial));

    act(() => {
      result.current.setSourceNameInput('BBC');
    });

    act(() => {
      result.current.handlers.handleAddSourceName();
    });

    expect(result.current.draft.preferredSourceNames).toHaveLength(1);
  });

  it('should remove source name', () => {
    const initial = {
      ...DEFAULT_PREFERENCES,
      preferredSourceNames: ['BBC', 'CNN'],
    };

    const { result } = renderHook(() => usePreferencesForm(initial));

    act(() => {
      result.current.handlers.handleRemoveSourceName('BBC');
    });

    expect(result.current.draft.preferredSourceNames).not.toContain('BBC');
    expect(result.current.draft.preferredSourceNames).toContain('CNN');
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
      preferredSourceNames: ['BBC'],
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
