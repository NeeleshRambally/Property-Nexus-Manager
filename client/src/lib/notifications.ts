// Push notification utilities

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

    // Subscribe to push notifications
    // Note: For production, you'll need to generate VAPID keys
    // For now, this creates a subscription without a server key
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: null // You'll need to add VAPID public key here later
    });

    console.log('Subscribed to push notifications:', subscription);

    // TODO: Send subscription to your backend to store it
    // await sendSubscriptionToBackend(subscription);

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

// Helper to send subscription to backend (implement based on your API)
async function sendSubscriptionToBackend(subscription: PushSubscription) {
  // TODO: Implement API call to send subscription to backend
  // const landlordIdNumber = localStorage.getItem('landlordIdNumber');
  // await fetch('/api/notifications/subscribe', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ landlordIdNumber, subscription })
  // });
  console.log('Subscription ready to be sent to backend:', subscription.toJSON());
}
