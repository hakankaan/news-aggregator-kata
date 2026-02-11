import { createContext } from 'react';
import type { UserPreferences } from '../types';

export interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  savePreferences: (preferences: UserPreferences) => void;
  resetPreferences: () => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
