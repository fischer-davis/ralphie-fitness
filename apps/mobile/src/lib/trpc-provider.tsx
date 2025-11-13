import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { TRPCProvider as TRPCContextProvider } from './trpc';
import { API_URL } from './config';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5000,
      },
    },
  }));

  const [trpcClient] = useState(() => ({
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
  }));

  return (
    <TRPCContextProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TRPCContextProvider>
  );
}
