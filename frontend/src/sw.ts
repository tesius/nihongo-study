/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Activate new SW immediately and take control of all clients
self.skipWaiting();
clientsClaim();

// Workbox precaching (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching for lesson API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/lesson/'),
  new StaleWhileRevalidate({
    cacheName: 'lesson-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// Push notification received
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || '日本語 Study';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification clicked - open the app
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if ((client as WindowClient).url.includes(self.location.origin)) {
          (client as WindowClient).navigate(url);
          return (client as WindowClient).focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});
