import { convertBase64ToUint8Array } from './index';
import { subscribeNotification, unsubscribeNotification } from '../data/api';

const VAPID_PUBLIC_KEY =
    'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Notification Permission
export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        alert('Browser kamu tidak mendukung Notification API.');
        return false;
    }

    const status = await Notification.requestPermission();
    if (status !== 'granted') {
        alert('Izin notifikasi ditolak atau diabaikan.');
        return false;
    }

    return true;
}

//Push Subscribe Handler
export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
    const subscription = await getPushSubscription();
    return !!subscription;
}

export function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };
}

//Subscribe Function
export async function subscribe() {
    if (!(await requestNotificationPermission())) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Kamu harus login dulu sebelum berlangganan notifikasi.');
        return;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        alert('Kamu sudah berlangganan push notification.');
        return;
    }

    console.log('Mulai berlangganan push notification...');
    const failureSubscribeMessage = 'Langganan push notification gagal.';
    const successSubscribeMessage = 'Berhasil berlangganan push notification.';
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
        const { endpoint, keys } = pushSubscription.toJSON();

        const response = await subscribeNotification(token, { endpoint, keys });
        if (response.error) throw new Error(response.message);

        console.log('Subscription berhasil:', { endpoint });
        alert(successSubscribeMessage);
    } catch (error) {
        console.error('subscribe: error:', error);
        alert(failureSubscribeMessage);
    }
}

//Unsubscribe Function
export async function unsubscribe() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return alert('Service Worker belum aktif.');

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        alert('Kamu belum berlangganan notifikasi.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Kamu harus login dulu untuk berhenti berlangganan.');
        return;
    }

    try {
        const { endpoint } = subscription;
        await unsubscribeNotification(token, endpoint);
        await subscription.unsubscribe();

        console.log('Berhenti berlangganan:', endpoint);
        alert('Berhasil berhenti berlangganan notifikasi.');
    } catch (error) {
        console.error('unsubscribe: error:', error);
        alert('Gagal berhenti berlangganan notifikasi.');
    }
}

// Subscribe Button Handler
export async function setupNotificationButton(buttonElement) {
    if (!buttonElement) return;

    async function updateButtonState() {
        const subscribed = await isCurrentPushSubscriptionAvailable();
        buttonElement.textContent = subscribed ? '🔕 Unsubscribe' : '🔔 Subscribe';
    }

    buttonElement.addEventListener('click', async () => {
        const subscribed = await isCurrentPushSubscriptionAvailable();
        if (subscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
        await updateButtonState();
    });

    await updateButtonState();
}
