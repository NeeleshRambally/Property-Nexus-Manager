// Push notification utilities
import { getApiUrl } from './api';

// Helper to convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Subscribe to push notifications with VAPID public key
    const vapidPublicKey = 'BNc72Bo0wXVZzlQzjcHBErK0gWEz4T37Bx6e99U8OvidV3WmsxRJjPPTL40S_fT-sdSOikATZ0ia1ByFQgkso5Y';

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('Subscribed to push notifications:', subscription);

    // Send subscription to backend to store it
    await sendSubscriptionToBackend(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

// Show a local notification (doesn't require push server)
export async function showLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }
  }

  if ('serviceWorker' in navigator) {
    // Use service worker to show notification (better for PWA)
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      ...options
    });
  } else {
    // Fallback to regular notification
    new Notification(title, {
      icon: '/favicon.png',
      ...options
    });
  }
}

// Helper to send subscription to backend
async function sendSubscriptionToBackend(subscription: PushSubscription) {
  try {
    const landlordIdNumber = localStorage.getItem('landlordIdNumber');

    if (!landlordIdNumber) {
      console.warn('No landlord ID found, skipping subscription');
      return;
    }

    const subscriptionData = subscription.toJSON();

    const response = await fetch(getApiUrl('/api/notifications/subscribe'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landlordIdNumber,
        subscription: {
          endpoint: subscriptionData.endpoint,
          keys: {
            p256dh: subscriptionData.keys?.p256dh,
            auth: subscriptionData.keys?.auth
          }
        }
      })
    });

    if (response.ok) {
      console.log('Subscription saved to backend successfully');
    } else {
      console.error('Failed to save subscription to backend:', await response.text());
    }
  } catch (error) {
    console.error('Error sending subscription to backend:', error);
  }
}
