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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Pencil, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  id: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  propertyType?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  squareMeters?: number;
  monthlyRent?: number;
  description?: string;
}

interface EditPropertyModalProps {
  property: Property;
  onPropertyUpdated?: () => void;
  children?: React.ReactNode;
}

export function EditPropertyModal({ property, onPropertyUpdated, children }: EditPropertyModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    address: property.address || "",
    city: property.city || "",
    province: property.province || "",
    postalCode: property.postalCode || "",
    propertyType: property.propertyType || "",
    numberOfBedrooms: property.numberOfBedrooms?.toString() || "",
    numberOfBathrooms: property.numberOfBathrooms?.toString() || "",
    squareMeters: property.squareMeters?.toString() || "",
    monthlyRent: property.monthlyRent?.toString() || "",
    description: property.description || "",
  });

  // Reset form data when property changes or modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        address: property.address || "",
        city: property.city || "",
        province: property.province || "",
        postalCode: property.postalCode || "",
        propertyType: property.propertyType || "",
        numberOfBedrooms: property.numberOfBedrooms?.toString() || "",
        numberOfBathrooms: property.numberOfBathrooms?.toString() || "",
        squareMeters: property.squareMeters?.toString() || "",
        monthlyRent: property.monthlyRent?.toString() || "",
        description: property.description || "",
      });
    }
  }, [property, open]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Address is required.",
      });
      return;
    }

    const landlordIdNumber = localStorage.getItem('landlordIdNumber');
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
      const response = await apiClient.post(`/api/landlords/${landlordIdNumber}/properties/${property.id}`, {
        address: formData.address,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
        propertyType: formData.propertyType || undefined,
        numberOfBedrooms: formData.numberOfBedrooms ? parseInt(formData.numberOfBedrooms) : undefined,
        numberOfBathrooms: formData.numberOfBathrooms ? parseInt(formData.numberOfBathrooms) : undefined,
        squareMeters: formData.squareMeters ? parseFloat(formData.squareMeters) : undefined,
        monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
        description: formData.description || undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update property");
      }

      toast({
        title: "Success!",
        description: "Property updated successfully.",
      });

      setOpen(false);

      // Notify parent component
      if (onPropertyUpdated) {
        onPropertyUpdated();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message || "Could not update property.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update the property details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleChange("address")}
                required
              />
            </div>

            {/* City, Province, Postal Code */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Cape Town"
                  value={formData.city}
                  onChange={handleChange("city")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  placeholder="Western Cape"
                  value={formData.province}
                  onChange={handleChange("province")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="8001"
                  value={formData.postalCode}
                  onChange={handleChange("postalCode")}
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={formData.propertyType} onValueChange={handleSelectChange("propertyType")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  placeholder="3"
                  value={formData.numberOfBedrooms}
                  onChange={handleChange("numberOfBedrooms")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  placeholder="2"
                  value={formData.numberOfBathrooms}
                  onChange={handleChange("numberOfBathrooms")}
                />
              </div>
            </div>

            {/* Square Meters and Monthly Rent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="squareMeters">Square Meters</Label>
                <Input
                  id="squareMeters"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="120"
                  value={formData.squareMeters}
                  onChange={handleChange("squareMeters")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (R)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="15000"
                  value={formData.monthlyRent}
                  onChange={handleChange("monthlyRent")}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter property description..."
                rows={4}
                value={formData.description}
                onChange={handleChange("description")}
              />
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
                  <span>Updating...</span>
                </div>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Update Property
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
