import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

let BASE_URL = '';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
    ({ url }) => {
        return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
    },
    new CacheFirst({
        cacheName: 'google-fonts',
    }),
);
registerRoute(
    ({ url }) => {
        return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
    },
    new CacheFirst({
        cacheName: 'fontawesome',
    }),
);
registerRoute(
    ({ url }) => {
        return url.origin === 'https://ui-avatars.com';
    },
    new CacheFirst({
        cacheName: 'avatars-api',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);
registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(BASE_URL);
        return baseUrl.origin === url.origin && request.destination !== 'image';
    },
    new NetworkFirst({
        cacheName: 'mykisahgw',
    }),
);
registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(BASE_URL);
        return baseUrl.origin === url.origin && request.destination === 'image';
    },
    new StaleWhileRevalidate({
        cacheName: 'mykisahgw-images',
    }),
);
registerRoute(
    ({ url }) => {
        return url.origin.includes('maptiler');
    },
    new CacheFirst({
        cacheName: 'maptiler-api',
    }),
);


// Service Worker Install
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

// Service Worker Active
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

// Push from Server
self.addEventListener('push', (event) => {
    console.log('Push event diterima:', event);

    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        console.warn('⚠️ Push data bukan JSON, fallback ke text:', e);
        data = { title: 'Notifikasi Baru', options: { body: event.data.text() } };
    }

    const title = data.title || 'Notifikasi';
    const options = data.options || {
        body: 'Ada notifikasi baru di sekitar kamu!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});


// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
