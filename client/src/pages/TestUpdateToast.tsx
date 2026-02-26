import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TestUpdateToast() {
  const { toast } = useToast();

  const showUpdateToast = () => {
    toast({
      title: "Update Available",
      description: "A new version of the app is available.",
      duration: Infinity,
      action: React.createElement(
        Button,
        {
          variant: "outline" as const,
          size: "sm" as const,
          onClick: () => {
            alert("This would normally reload the page!");
            // window.location.reload();
          },
        },
        "Refresh"
      ),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Testing</p>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Test Update Toast</h1>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px]">
        <CardHeader>
          <CardTitle>Update Notification Test</CardTitle>
          <CardDescription>
            Click the button below to test the update notification toast with refresh button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={showUpdateToast}>
            Show Update Toast
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px]">
        <CardHeader>
          <CardTitle>How the Real Update Detection Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">Automatic Detection:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The app checks for updates every 30 seconds</li>
              <li>It compares the build hash in the index.html file</li>
              <li>When a new build is deployed, the hash changes</li>
              <li>The toast appears automatically with a Refresh button</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">To Test in Real Life:</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Keep this app open in your browser</li>
              <li>Run <code className="bg-muted px-1 rounded">npm run build</code> in terminal</li>
              <li>Wait up to 30 seconds</li>
              <li>The update toast will appear automatically</li>
              <li>Click "Refresh" to load the new version</li>
            </ol>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">Current Build Hash:</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
              Check browser console for: "Build hash stored" message
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
