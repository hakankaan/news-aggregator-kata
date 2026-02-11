import { useState, useCallback, useEffect } from 'react';

/**
 * Storage adapter interface for dependency injection.
 * Enables testing without mocking globals.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Default adapter using browser localStorage */
export const localStorageAdapter: StorageAdapter = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};

/** In-memory adapter for testing */
export function createMemoryStorageAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
}

interface UseLocalStorageOptions<T> {
  storage?: StorageAdapter;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

/**
 * Hook for reading and writing values to localStorage with automatic serialization.
 *
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @param options - Optional configuration for storage adapter and serialization
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    storage = localStorageAdapter,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const readValue = useCallback((): T => {
    try {
      const item = storage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, storage, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        storage.setItem(key, serialize(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, storage, serialize]
  );

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue, storage]);

  // Sync with storage on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}
