import { useCallback, useState, type ReactNode } from 'react';
import { DEFAULT_PREFERENCES, type UserPreferences } from '../types';
import { PreferencesContext } from './preferences-context';

const STORAGE_KEY = 'news-preferences';

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const savePreferencesToStorage = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        savePreferences: savePreferencesToStorage,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
