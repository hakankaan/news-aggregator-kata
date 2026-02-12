import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';
import { resetArticleIdCounter } from './mocks/fixtures';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Mock localStorage with working implementation for integration tests
const localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
  }),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Export helper to pre-populate localStorage for tests
export function setLocalStorageItem(key: string, value: unknown): void {
  localStorageStore[key] = JSON.stringify(value);
}

export function clearLocalStorage(): void {
  Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
}

// Mock IntersectionObserver for infinite scroll tests
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  constructor() { }

  observe(): void { }
  unobserve(): void { }
  disconnect(): void { }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Reset handlers and cleanup after each test
afterEach(() => {
  server.resetHandlers();
  resetArticleIdCounter();
  clearLocalStorage();
  cleanup();
  vi.clearAllMocks();
});

// Stop MSW server after all tests
afterAll(() => {
  server.close();
});

// Mock environment variables for tests
vi.mock('@/config/env', () => ({
  env: {
    APP_URL: 'http://localhost:3000',
    NEWSAPI_KEY: 'test-newsapi-key',
    GNEWS_KEY: 'test-gnews-key',
    NYTIMES_KEY: 'test-nytimes-key',
  },
}));
