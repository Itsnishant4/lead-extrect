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
            // Realtime-optimized defaults: short stale for polling keys,
            // per-query overrides set exact cadence. Global 30s avoids
            // 15-minute stale snapshots while keeping static pages cheap.
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            retry: 2,
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

  // Never persist high-churn realtime keys — they rehydrate stale snapshots
  // and fight 2s polling. Persist static keys (plans, settings) only.
  const REALTIME_KEYS = [
    'tasks',
    'tasks-progress',
    'admin-tasks',
    'admin-tasks-detailed',
    'admin-stats',
    'admin-charts',
    'admin-insights',
    'admin-logs',
    'admin-payments',
    'admin-subscribers',
    'admin-user-locations',
    'notifications',
    'notification-unread-count',
  ];

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = String(query.queryKey?.[0] ?? '');
            if (REALTIME_KEYS.includes(key)) return false;
            return query.state.status === 'success';
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
