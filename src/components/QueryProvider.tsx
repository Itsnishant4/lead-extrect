'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 15 * 1000, // 15 minutes
            gcTime: 60 * 60 * 1000, // Garbage fail time (1 hour)
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // Ensure localStorage is only accessed on client
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
    });
    setPersister(localStoragePersister);
  }, []);

  if (!persister) {
    // Return null or loader during initial mount to avoid hydration mismatch
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 60 * 60 * 1000 }} // Persist for 1 hour
    >
      {children}
    </PersistQueryClientProvider>
  );
}
