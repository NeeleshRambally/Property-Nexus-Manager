import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tenants from "./pages/Tenants";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import TenantDocuments from "./pages/TenantDocuments";
import Notifications from "./pages/Notifications";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Basic mockup authentication check
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Redirect to login if not authenticated and not already on login/register page
  if (!isAuthenticated && location !== "/login" && location !== "/register") {
    // Wrap in timeout to avoid updating state during render
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  // Redirect to dashboard if authenticated and on login/register page
  if (isAuthenticated && (location === "/login" || location === "/register")) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route>
        <SidebarLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/properties" component={Properties} />
            <Route path="/properties/:id" component={PropertyDetail} />
            <Route path="/tenants" component={Tenants} />
            <Route path="/tenants/:idNumber/documents" component={TenantDocuments} />
            <Route path="/notifications" component={Notifications} />
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
      </Route>
    </Switch>
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