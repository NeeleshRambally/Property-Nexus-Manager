import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import Dashboard from "./pages/Dashboard";

function Router() {
  return (
    <SidebarLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        {/* Placeholder routes for navigation */}
        <Route path="/properties">
          <div className="p-8"><h1 className="text-2xl font-bold">Properties</h1><p className="text-muted-foreground">Properties management coming soon.</p></div>
        </Route>
        <Route path="/tenants">
          <div className="p-8"><h1 className="text-2xl font-bold">Tenants</h1><p className="text-muted-foreground">Tenant management coming soon.</p></div>
        </Route>
        <Route path="/documents">
          <div className="p-8"><h1 className="text-2xl font-bold">Documents</h1><p className="text-muted-foreground">Document center coming soon.</p></div>
        </Route>
        <Route path="/maintenance">
          <div className="p-8"><h1 className="text-2xl font-bold">Maintenance</h1><p className="text-muted-foreground">Maintenance ticketing coming soon.</p></div>
        </Route>
        <Route path="/financials">
          <div className="p-8"><h1 className="text-2xl font-bold">Financials</h1><p className="text-muted-foreground">Financial reporting coming soon.</p></div>
        </Route>
        <Route path="/messages">
          <div className="p-8"><h1 className="text-2xl font-bold">Messages</h1><p className="text-muted-foreground">Messaging center coming soon.</p></div>
        </Route>
        <Route path="/settings">
          <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Account and role settings coming soon.</p></div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;