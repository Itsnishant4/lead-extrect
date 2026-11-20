// LeadSpotter Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'LeadSpotter', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'leadspotter-notification',
    renotify: true,
    data: {
      url: data.url || '/',
    },
  };

  // Foreground fast-path: wake open tabs so TanStack caches invalidate
  // instantly instead of waiting for next 2s/15s poll tick. Polling
  // remains fallback when push denied or SW uncontrolled.
  const broadcast = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: 'TASKS_CHANGED',
          tag: data.tag || 'leadspotter-notification',
          title: data.title || 'LeadSpotter',
          url: data.url || '/',
        });
      }
    })
    .catch(() => {});

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'LeadSpotter', options),
      broadcast,
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if found
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});
