import { useEffect, useRef, createElement } from "react";
import { useToast } from "./use-toast";
import { Button } from "@/components/ui/button";

const VERSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export function useVersionCheck() {
  const { toast } = useToast();
  const buildHashRef = useRef<string | null>(null);
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Fetch index.html with cache-busting
        const response = await fetch('/?t=' + Date.now(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const html = await response.text();

          // Extract the script src hash from index.html
          // Vite generates scripts like: <script type="module" crossorigin src="/assets/main-[hash].js"></script>
          const scriptMatch = html.match(/src="\/assets\/main-([a-zA-Z0-9]+)\.js"/);

          if (scriptMatch) {
            const currentHash = scriptMatch[1];

            if (buildHashRef.current === null) {
              // First check - store the hash
              buildHashRef.current = currentHash;
              console.log('[Version Check] Build hash stored:', currentHash);
            } else if (currentHash !== buildHashRef.current && !hasShownToastRef.current) {
              // Hash changed - new build detected
              hasShownToastRef.current = true;
              console.log('[Version Check] New build detected! Old:', buildHashRef.current, 'New:', currentHash);

              toast({
                title: "Update Available",
                description: "A new version of the app is available.",
                duration: Infinity, // Don't auto-dismiss
                action: createElement(
                  Button,
                  {
                    variant: "outline" as const,
                    size: "sm" as const,
                    onClick: () => window.location.reload(),
                  },
                  "Refresh"
                ),
              });
            } else {
              console.log('[Version Check] No changes detected. Current hash:', currentHash);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Check immediately on mount
    checkForUpdates();

    // Set up interval to check periodically
    const interval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [toast]);
}
