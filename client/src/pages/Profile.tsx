import React from "react";
import { useLocation } from "wouter";
import { User, Mail, Phone, IdCard, Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface LandlordProfile {
  idNumber: string;
  name?: string;
  surname?: string;
  email?: string;
  cellNumber?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState<LandlordProfile>({
    idNumber: "",
    name: "",
    surname: "",
    email: "",
    cellNumber: "",
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const landlordIdNumber = localStorage.getItem("landlordIdNumber");

      if (!landlordIdNumber) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No landlord ID found. Please log in again.",
        });
        setLocation("/login");
        return;
      }

      const response = await apiClient.get(`/api/landlords/${landlordIdNumber}`);

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setFormData({
        idNumber: data.idNumber || "",
        name: data.name || "",
        surname: data.surname || "",
        email: data.email || "",
        cellNumber: data.cellNumber || "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load profile data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LandlordProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiClient.post(`/api/landlords`, {
        idNumber: formData.idNumber,
        name: formData.name || undefined,
        surname: formData.surname || undefined,
        email: formData.email,
        cellNumber: formData.cellNumber || undefined,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile");
      }

      // Update localStorage if email changed
      if (formData.email) {
        localStorage.setItem("userEmail", formData.email);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details. Your ID number cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* ID Number - Disabled */}
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="idNumber"
                  type="text"
                  value={formData.idNumber}
                  className="pl-10 bg-muted"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your ID number cannot be changed for security reasons.
              </p>
            </div>

            {/* Name and Surname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="First name"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleChange("name")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Last name"
                  value={formData.surname}
                  onChange={handleChange("surname")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>
            </div>

            {/* Cell Number */}
            <div className="space-y-2">
              <Label htmlFor="cellNumber">Cell Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cellNumber"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  className="pl-10"
                  value={formData.cellNumber}
                  onChange={handleChange("cellNumber")}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
