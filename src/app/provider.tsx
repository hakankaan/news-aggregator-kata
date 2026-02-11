import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';
import { queryConfig } from '@/lib/react-query';
import { Toaster } from '@/components/ui/sonner';
import { PreferencesProvider } from '@/features/news/stores/preferences-provider';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <PreferencesProvider>
            {import.meta.env.DEV && <ReactQueryDevtools />}
            <Toaster />
            {children}
          </PreferencesProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
