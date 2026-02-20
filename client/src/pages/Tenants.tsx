import React from "react";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestScreeningModal } from "@/components/RequestScreeningModal";
import { apiClient } from "@/lib/api";

export default function Tenants() {
  const [vettingRequests, setVettingRequests] = React.useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = React.useState(true);

  const fetchVettingRequests = React.useCallback(async () => {
    const landlordIdNumber = localStorage.getItem("landlordIdNumber");
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
  }, []);

  React.useEffect(() => {
    fetchVettingRequests();

    // Listen for new vetting requests
    const handleNewRequest = () => fetchVettingRequests();
    window.addEventListener("vettingRequestCreated", handleNewRequest);
    return () => window.removeEventListener("vettingRequestCreated", handleNewRequest);
  }, [fetchVettingRequests]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Tenant Management</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Screening Requests</h1>
        </div>
        <RequestScreeningModal />
      </div>

      {/* Vetting Requests Table */}
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
    </div>
  );
}
