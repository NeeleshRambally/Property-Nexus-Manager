import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { requestNotificationPermission, subscribeToPushNotifications } from "./lib/notifications";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);

        // Check for updates every 60 seconds (production only)
        if (import.meta.env.PROD) {
          setInterval(() => {
            registration.update();
          }, 60000);
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user to refresh
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Request notification permission and subscribe after service worker is ready
        setTimeout(async () => {
          // Only auto-request if user is authenticated
          if (localStorage.getItem('isAuthenticated') === 'true') {
            const permission = await requestNotificationPermission();
            if (permission === 'granted') {
              await subscribeToPushNotifications();
            }
          }
        }, 2000); // Wait 2 seconds after app loads to avoid overwhelming user
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
