import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const CAMERAS_QUERY_KEY = ['cameras'] as const;

export function invalidateCameras() {
  return queryClient.invalidateQueries({ queryKey: CAMERAS_QUERY_KEY });
}
