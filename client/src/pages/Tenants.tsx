import React from "react";
import { UserPlus, Mail, Phone, FileText, Link as LinkIcon, Unlink, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RequestScreeningModal } from "@/components/RequestScreeningModal";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TenantLandlordHistory {
  landlordIdNumber: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

interface Tenant {
  idNumber: string;
  name?: string;
  surname?: string;
  email?: string;
  cellNumber?: string;
  currentLandlordIdNumber?: string;
  landlordHistory: TenantLandlordHistory[];
  createdAt: string;
  lastSignIn?: string;
}

export default function Tenants() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentTenants, setCurrentTenants] = React.useState<Tenant[]>([]);
  const [previousTenants, setPreviousTenants] = React.useState<Tenant[]>([]);
  const [vettingRequests, setVettingRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = React.useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = React.useState(false);
  const [tenantIdToLink, setTenantIdToLink] = React.useState("");
  const [tenantToUnlink, setTenantToUnlink] = React.useState<Tenant | null>(null);
  const [isLinking, setIsLinking] = React.useState(false);

  const landlordIdNumber = localStorage.getItem("landlordIdNumber");

  const fetchTenants = React.useCallback(async () => {
    if (!landlordIdNumber) return;

    setIsLoading(true);
    try {
      // Fetch all tenants (current + previous)
      const response = await apiClient.get(`/api/landlords/${landlordIdNumber}/tenants/all`);
      if (response.ok) {
        const allTenants: Tenant[] = await response.json();

        // Categorize tenants
        const current = allTenants.filter(t => t.currentLandlordIdNumber === landlordIdNumber);
        const previous = allTenants.filter(t =>
          t.currentLandlordIdNumber !== landlordIdNumber &&
          t.landlordHistory.some(h => h.landlordIdNumber === landlordIdNumber && !h.isCurrent)
        );

        setCurrentTenants(current);
        setPreviousTenants(previous);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tenants.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [landlordIdNumber, toast]);

  const fetchVettingRequests = React.useCallback(async () => {
    if (!landlordIdNumber) return;

    try {
      const response = await apiClient.get(`/api/vetting/landlord/${landlordIdNumber}`);
      if (response.ok) {
        const data = await response.json();
        setVettingRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch vetting requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [landlordIdNumber]);

  React.useEffect(() => {
    fetchTenants();
    fetchVettingRequests();

    // Listen for new vetting requests
    const handleNewRequest = () => fetchVettingRequests();
    const handleTenantLinked = () => {
      console.log('Tenant linked event received, refreshing...');
      fetchTenants();
    };
    const handleTenantUnlinked = () => {
      console.log('Tenant unlinked event received, refreshing...');
      fetchTenants();
    };

    window.addEventListener("vettingRequestCreated", handleNewRequest);
    window.addEventListener("tenantLinked", handleTenantLinked);
    window.addEventListener("tenantUnlinked", handleTenantUnlinked);

    return () => {
      window.removeEventListener("vettingRequestCreated", handleNewRequest);
      window.removeEventListener("tenantLinked", handleTenantLinked);
      window.removeEventListener("tenantUnlinked", handleTenantUnlinked);
    };
  }, [fetchTenants, fetchVettingRequests]);

  const handleLinkTenant = async () => {
    if (!landlordIdNumber || !tenantIdToLink) return;

    setIsLinking(true);
    try {
      const response = await apiClient.post(
        `/api/landlords/${landlordIdNumber}/tenants/link`,
        { tenantIdNumber: tenantIdToLink }
      );

      if (!response.ok) {
        throw new Error("Failed to link tenant");
      }

      toast({
        title: "Success",
        description: "Tenant linked successfully!",
      });

      setLinkDialogOpen(false);
      setTenantIdToLink("");
      fetchTenants();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to link tenant.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkTenant = async () => {
    if (!landlordIdNumber || !tenantToUnlink) return;

    setIsLinking(true);
    try {
      // Step 1: Find the property associated with this tenant
      const propertiesResponse = await apiClient.get(`/api/landlords/${landlordIdNumber}/properties`);
      if (propertiesResponse.ok) {
        const properties = await propertiesResponse.json();
        const tenantProperty = properties.find((p: any) => p.currentTenantIdNumber === tenantToUnlink.idNumber);

        // Step 2: If property found, mark it as vacant first
        if (tenantProperty) {
          try {
            await apiClient.post(
              `/api/landlords/${landlordIdNumber}/properties/${tenantProperty.id}/mark-vacant`,
              {}
            );
          } catch (vacantError) {
            console.error("Failed to mark property as vacant:", vacantError);
            // Continue anyway - we'll still try to unlink tenant
          }
        }
      }

      // Step 3: Unlink tenant
      const response = await apiClient.post(
        `/api/landlords/${landlordIdNumber}/tenants/${tenantToUnlink.idNumber}/unlink`,
        {}
      );

      if (!response.ok) {
        throw new Error("Failed to unlink tenant");
      }

      toast({
        title: "Success",
        description: "Tenant unlinked and property marked as vacant!",
      });

      setUnlinkDialogOpen(false);
      setTenantToUnlink(null);

      // Dispatch event to refresh other pages
      window.dispatchEvent(new Event('tenantUnlinked'));

      fetchTenants();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unlink tenant.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const getTenantPeriod = (tenant: Tenant) => {
    const history = tenant.landlordHistory.find(
      h => h.landlordIdNumber === landlordIdNumber
    );

    if (!history) return null;

    const from = new Date(history.startDate).toLocaleDateString();
    const to = history.endDate ? new Date(history.endDate).toLocaleDateString() : 'Present';

    return { from, to, isCurrent: history.isCurrent };
  };

  const renderTenantCard = (tenant: Tenant, isCurrent: boolean) => {
    const period = getTenantPeriod(tenant);

    return (
      <Card
        key={tenant.idNumber}
        className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all"
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-16 w-16 rounded-2xl flex-shrink-0">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                {tenant.name && tenant.surname
                  ? (tenant.name.charAt(0) + tenant.surname.charAt(0)).toUpperCase()
                  : tenant.idNumber.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold">
                    {tenant.name && tenant.surname
                      ? `${tenant.name} ${tenant.surname}`
                      : `Tenant ${tenant.idNumber}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">ID: {tenant.idNumber}</p>
                </div>
                {isCurrent && (
                  <Badge className="rounded-full bg-emerald-500 text-white">
                    Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {tenant.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{tenant.email}</span>
                  </div>
                )}
                {tenant.cellNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{tenant.cellNumber}</span>
                  </div>
                )}
              </div>

              {period && (
                <div className="text-xs text-muted-foreground mb-4">
                  <span className="font-medium">Period:</span> {period.from} - {period.to}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {isCurrent && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setLocation(`/tenants/${tenant.idNumber}/documents?propertyId=none`)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Documents
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setTenantToUnlink(tenant);
                        setUnlinkDialogOpen(true);
                      }}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Unlink
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Tenant Management</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Tenants</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="rounded-full">
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Link Tenant</DialogTitle>
                <DialogDescription>
                  Enter the tenant's ID number to link them to your account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID Number</Label>
                  <Input
                    id="tenantId"
                    placeholder="Enter tenant ID number"
                    value={tenantIdToLink}
                    onChange={(e) => setTenantIdToLink(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkDialogOpen(false);
                    setTenantIdToLink("");
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkTenant}
                  disabled={!tenantIdToLink || isLinking}
                  className="rounded-full"
                >
                  {isLinking ? "Linking..." : "Link Tenant"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <RequestScreeningModal />
        </div>
      </div>

      {/* Unlink Confirmation Dialog */}
      <Dialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Unlink Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink {tenantToUnlink?.name} {tenantToUnlink?.surname}? This will end the current tenancy relationship.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setUnlinkDialogOpen(false);
                setTenantToUnlink(null);
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlinkTenant}
              disabled={isLinking}
              className="rounded-full"
            >
              {isLinking ? "Unlinking..." : "Unlink"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-full">
          <TabsTrigger value="current" className="rounded-full">
            Current Tenants ({currentTenants.length})
          </TabsTrigger>
          <TabsTrigger value="previous" className="rounded-full">
            Previous Tenants ({previousTenants.length})
          </TabsTrigger>
          <TabsTrigger value="screening" className="rounded-full">
            Screening ({vettingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Tenants Tab */}
        <TabsContent value="current" className="space-y-6 mt-8">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              Loading tenants...
            </div>
          ) : currentTenants.length === 0 ? (
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
              <CardContent className="p-12 text-center text-muted-foreground">
                <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No current tenants</p>
                <p className="text-sm mt-1">Click "Link Tenant" to add a tenant</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {currentTenants.map((tenant) => renderTenantCard(tenant, true))}
            </div>
          )}
        </TabsContent>

        {/* Previous Tenants Tab */}
        <TabsContent value="previous" className="space-y-6 mt-8">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              Loading tenants...
            </div>
          ) : previousTenants.length === 0 ? (
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
              <CardContent className="p-12 text-center text-muted-foreground">
                <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No previous tenants</p>
                <p className="text-sm mt-1">Previous tenants will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {previousTenants.map((tenant) => renderTenantCard(tenant, false))}
            </div>
          )}
        </TabsContent>

        {/* Screening Requests Tab */}
        <TabsContent value="screening" className="mt-8">
          <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">All Screening Requests</CardTitle>
                <Badge variant="secondary" className="rounded-full">
                  {vettingRequests.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingRequests ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                  Loading requests...
                </div>
              ) : vettingRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No screening requests yet</p>
                  <p className="text-xs mt-1">Click "Request Screening" to get started</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {vettingRequests.map((request) => (
                      <div key={request.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-black/[0.02] transition-colors">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                            <p className="text-sm font-bold">{request.uniqueReference}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                            <p className="text-sm font-medium truncate">{request.tenantEmail}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tenant ID</p>
                            <p className="text-sm font-medium">{request.tenantIdNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Request Date</p>
                            <p className="text-sm font-medium">{new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={request.status === "Completed" ? "default" : "secondary"}
                            className="rounded-full"
                          >
                            {request.status}
                          </Badge>
                          {request.emailSent && (
                            <Badge variant="outline" className="rounded-full text-xs">
                              Email Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
