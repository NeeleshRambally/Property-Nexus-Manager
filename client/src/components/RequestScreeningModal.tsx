import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { UserPlus, Mail, IdCard } from "lucide-react";

interface RequestScreeningModalProps {
  children?: React.ReactNode;
}

export function RequestScreeningModal({ children }: RequestScreeningModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    tenantEmail: "",
    tenantIdNumber: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenantEmail || !formData.tenantIdNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Get landlord ID from localStorage
    const landlordIdNumber = localStorage.getItem("landlordIdNumber");
    if (!landlordIdNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Landlord information not found. Please log in again.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/api/vetting/request", {
        landlordIdNumber,
        tenantEmail: formData.tenantEmail,
        tenantIdNumber: formData.tenantIdNumber,
        propertyId: null, // Leave out for now as requested
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create vetting request");
      }

      toast({
        title: "Success!",
        description: "Screening request sent successfully.",
      });

      // Reset form and close modal
      setFormData({ tenantEmail: "", tenantIdNumber: "" });
      setOpen(false);

      // Trigger a refresh of the vetting requests list
      window.dispatchEvent(new Event("vettingRequestCreated"));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message || "Could not create screening request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="shadow-md">
            <UserPlus className="w-4 h-4 mr-2" />
            Request Screening
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Tenant Screening</DialogTitle>
          <DialogDescription>
            Submit a tenant screening request. The tenant will receive an email to complete their screening.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenantEmail">
                Tenant Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tenantEmail"
                  type="email"
                  placeholder="tenant@example.com"
                  className="pl-10"
                  value={formData.tenantEmail}
                  onChange={handleChange("tenantEmail")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantIdNumber">
                Tenant ID Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tenantIdNumber"
                  type="text"
                  placeholder="ID Number"
                  className="pl-10"
                  value={formData.tenantIdNumber}
                  onChange={handleChange("tenantIdNumber")}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
