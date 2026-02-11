import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

type LazyRouteModule = {
  clientLoader?: (queryClient: QueryClient) => RouteObject['loader'];
  clientAction?: (queryClient: QueryClient) => RouteObject['action'];
  default?: RouteObject['Component'];
  ErrorBoundary?: RouteObject['ErrorBoundary'];
  HydrateFallback?: RouteObject['HydrateFallback'];
};

const convert = (queryClient: QueryClient) => (m: LazyRouteModule) => {
  const { clientLoader, clientAction, default: Component, ErrorBoundary, HydrateFallback, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader ? clientLoader(queryClient) : undefined,
    action: clientAction ? clientAction(queryClient) : undefined,
    Component,
    ErrorBoundary,
    HydrateFallback,
  };
};

const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '*',
      lazy: () => import('./routes/not-found.tsx').then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};