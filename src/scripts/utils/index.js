import CONFIG from '../config';

export function isServiceWorkerAvailable() {
    return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
    if (!isServiceWorkerAvailable()) {
        console.warn('Service Worker tidak didukung browser ini.');
        return;
    }

    try {
        // --- Deteksi basePath otomatis ---
        const pathParts = window.location.pathname.split('/');
        const repoSegment = pathParts[1];
        const isGithubPages = window.location.hostname.includes('github.io');
        const basePath = isGithubPages ? `/${repoSegment}` : '';

        // --- Register service worker ---
        const registration = await navigator.serviceWorker.register(`${basePath}/sw.bundle.js`);

        const sendBaseUrlToSW = () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ baseUrl: CONFIG.BASE_URL });
            } else {
                console.warn('Service Worker belum mengontrol halaman.');
            }
        };

        if (registration.active) {
            sendBaseUrlToSW();
        } else {
            navigator.serviceWorker.addEventListener('controllerchange', sendBaseUrlToSW);
        }

    } catch (error) {
        console.error('Gagal memasang Service Worker:', error);
    }
}

export function convertBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
