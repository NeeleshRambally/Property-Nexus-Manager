import React from "react";
import { useRoute, useLocation } from "wouter";
import { Building2, MapPin, Bed, Bath, Maximize, ArrowLeft, Plus, X, Camera, User, FileText, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient, getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EditPropertyModal } from "@/components/EditPropertyModal";

interface Tenant {
  idNumber: string;
  name?: string;
  surname?: string;
  email?: string;
  cellNumber?: string;
}

interface TenantHistory {
  tenantIdNumber: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

interface LandlordHistory {
  landlordIdNumber: string;
  startDate: string;
  endDate?: string;
}

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
  currentLandlordIdNumber?: string;
  landlordHistory: LandlordHistory[];
  currentTenantIdNumber?: string;
  tenantHistory: TenantHistory[];
  images: string[];
  status: 0 | 1 | 2 | string | number;
  createdAt: string;
  updatedAt: string;
}

export default function PropertyDetail() {
  const [, params] = useRoute("/properties/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = React.useState(false);
  const [tenantIdNumber, setTenantIdNumber] = React.useState("");
  const [tenants, setTenants] = React.useState<Map<string, Tenant>>(new Map());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchProperty = React.useCallback(async () => {
    if (!params?.id) return;

    try {
      const response = await apiClient.get(`/api/properties/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Property not found.",
        });
        setLocation("/properties");
      }
    } catch (error) {
      console.error("Failed to fetch property:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load property details.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params?.id, toast, setLocation]);

  const fetchImageUrls = React.useCallback(async () => {
    if (!params?.id) return;

    try {
      const response = await apiClient.get(`/api/landlords/properties/${params.id}/images`);
      if (response.ok) {
        const urls = await response.json();
        setImageUrls(urls);
      }
    } catch (error) {
      console.error("Failed to fetch image URLs:", error);
    }
  }, [params?.id]);

  const fetchTenantDetails = React.useCallback(async (tenantIdNumbers: string[]) => {
    const newTenants = new Map(tenants);

    for (const idNumber of tenantIdNumbers) {
      if (newTenants.has(idNumber)) continue; // Skip if already fetched

      try {
        const response = await apiClient.get(`/api/tenants/${idNumber}`);
        if (response.ok) {
          const tenant = await response.json();
          newTenants.set(idNumber, tenant);
        }
      } catch (error) {
        console.error(`Failed to fetch tenant ${idNumber}:`, error);
      }
    }

    setTenants(newTenants);
  }, [tenants]);

  React.useEffect(() => {
    fetchProperty();
    fetchImageUrls();
  }, [fetchProperty, fetchImageUrls]);

  React.useEffect(() => {
    if (!property) return;

    const tenantIds: string[] = [];
    if (property.currentTenantIdNumber) {
      tenantIds.push(property.currentTenantIdNumber);
    }
    if (property.tenantHistory) {
      property.tenantHistory.forEach(t => {
        if (!tenantIds.includes(t.tenantIdNumber)) {
          tenantIds.push(t.tenantIdNumber);
        }
      });
    }

    if (tenantIds.length > 0) {
      fetchTenantDetails(tenantIds);
    }
  }, [property]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !property) return;

    setIsUploadingImage(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl(`/api/landlords/properties/${property.id}/images`), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });

      await fetchImageUrls();
      setUploadDialogOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload image.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (fileName: string) => {
    if (!property) return;

    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(getApiUrl(`/api/landlords/properties/${property.id}/images/${encodeURIComponent(fileName)}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });

      await fetchImageUrls();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete image.",
      });
    }
  };

  const handleMarkOccupied = async (tenantIdNumber: string) => {
    if (!property) return;

    const landlordIdNumber = localStorage.getItem('landlordIdNumber');
    if (!landlordIdNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Landlord information not found.",
      });
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/landlords/${landlordIdNumber}/properties/${property.id}/mark-occupied`,
        { tenantIdNumber }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark property as occupied");
      }

      toast({
        title: "Success",
        description: "Property marked as occupied!",
      });

      await fetchProperty();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message || "Could not mark property as occupied.",
      });
    }
  };

  const handleMarkVacant = async () => {
    if (!property) return;

    const landlordIdNumber = localStorage.getItem('landlordIdNumber');
    if (!landlordIdNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Landlord information not found.",
      });
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/landlords/${landlordIdNumber}/properties/${property.id}/mark-vacant`,
        {}
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark property as vacant");
      }

      toast({
        title: "Success",
        description: "Property marked as vacant!",
      });

      await fetchProperty();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message || "Could not mark property as vacant.",
      });
    }
  };

  const handleMarkUnavailable = async () => {
    if (!property) return;

    const landlordIdNumber = localStorage.getItem('landlordIdNumber');
    if (!landlordIdNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Landlord information not found.",
      });
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/landlords/${landlordIdNumber}/properties/${property.id}/mark-unavailable`,
        {}
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark property as unavailable");
      }

      toast({
        title: "Success",
        description: "Property marked as unavailable!",
      });

      await fetchProperty();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message || "Could not mark property as unavailable.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        Loading property...
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/properties")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Property Details</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{property.address}</h1>
          {(property.city || property.province) && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{[property.city, property.province, property.postalCode].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <EditPropertyModal property={property} onPropertyUpdated={fetchProperty} />
          <Badge className={`rounded-full ${
            property.status === "0" || property.status === 0 ? 'bg-orange-500 text-white hover:bg-orange-600' :
            property.status === "1" || property.status === 1 ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
            'bg-gray-500 text-white hover:bg-gray-600'
          }`}>
            {property.status === "0" || property.status === 0 ? 'Vacant' :
             property.status === "1" || property.status === 1 ? 'Occupied' :
             property.status === "2" || property.status === 2 ? 'Unavailable' : 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Images Section */}
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Property Images</CardTitle>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Property Image</DialogTitle>
                  <DialogDescription>
                    Select an image from your device or take a photo
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="property-image-upload"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="property-image-upload"
                    className={`flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                      isUploadingImage
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-gray-400 mb-4" />
                        <span className="text-sm font-medium text-gray-900 mb-1">
                          Click to upload or take a photo
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, WEBP up to 10MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {imageUrls && imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageUrls.map((imageUrl, index) => {
                const fileName = imageUrl.split('/').pop() || `image-${index}`;
                return (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 group">
                    <img
                      src={getApiUrl(`/api/landlords/properties/${property.id}/images/${encodeURIComponent(fileName)}`)}
                      alt={`${property.address} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteImage(fileName)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No images yet</p>
              <p className="text-xs mt-1">Click "Upload Image" to add photos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {property.description && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px]">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Description</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px]">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Specifications</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {property.numberOfBedrooms !== undefined && property.numberOfBedrooms !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Bed className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Bedrooms</span>
                </div>
                <span className="text-lg font-bold">{property.numberOfBedrooms}</span>
              </div>
            )}
            {property.numberOfBathrooms !== undefined && property.numberOfBathrooms !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Bath className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Bathrooms</span>
                </div>
                <span className="text-lg font-bold">{property.numberOfBathrooms}</span>
              </div>
            )}
            {property.squareMeters !== undefined && property.squareMeters !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Maximize className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-medium">Square Meters</span>
                </div>
                <span className="text-lg font-bold">{property.squareMeters} m²</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px]">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Financial</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {property.monthlyRent !== undefined && property.monthlyRent !== null && (
              <div className="p-6 bg-primary/5 rounded-2xl">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  Monthly Rent
                </p>
                <p className="text-3xl font-bold text-primary">
                  R {property.monthlyRent.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Status Management */}
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
          <CardTitle className="text-lg font-bold">Property Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Status:</span>
              <Badge className={`rounded-full ${
                property.status === 0 || property.status === "0" ? 'bg-orange-500 text-white hover:bg-orange-600' :
                property.status === 1 || property.status === "1" ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                'bg-gray-500 text-white hover:bg-gray-600'
              }`}>
                {property.status === 0 || property.status === "0" ? 'Vacant' :
                 property.status === 1 || property.status === "1" ? 'Occupied' :
                 property.status === 2 || property.status === "2" ? 'Unavailable' : 'Unknown'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {(property.status === 0 || property.status === "0") && (
                <>
                  <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="rounded-full">
                        Mark as Occupied
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mark Property as Occupied</DialogTitle>
                        <DialogDescription>
                          Enter the tenant's ID number to link them to this property.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenantId">Tenant ID Number</Label>
                          <Input
                            id="tenantId"
                            placeholder="Enter tenant ID number"
                            value={tenantIdNumber}
                            onChange={(e) => setTenantIdNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setTenantDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          handleMarkOccupied(tenantIdNumber);
                          setTenantDialogOpen(false);
                          setTenantIdNumber("");
                        }}>
                          Confirm
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="rounded-full" onClick={handleMarkUnavailable}>
                    Mark as Unavailable
                  </Button>
                </>
              )}

              {(property.status === 1 || property.status === "1") && (
                <Button variant="default" className="rounded-full" onClick={handleMarkVacant}>
                  Mark as Vacant
                </Button>
              )}

              {(property.status === 2 || property.status === "2") && (
                <Button variant="default" className="rounded-full" onClick={handleMarkVacant}>
                  Mark as Vacant
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Tenant Section */}
      {property.currentTenantIdNumber && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Current Tenant</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const tenant = tenants.get(property.currentTenantIdNumber);
              const currentTenantHistory = property.tenantHistory?.find(t => t.isCurrent);

              return (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-2xl flex-shrink-0">
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                        {tenant?.name && tenant?.surname ?
                          (tenant.name.charAt(0) + tenant.surname.charAt(0)).toUpperCase() :
                          property.currentTenantIdNumber.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 min-w-0 flex-1">
                      <div>
                        <h3 className="font-bold text-lg">
                          {tenant?.name && tenant?.surname ?
                            `${tenant.name} ${tenant.surname}` :
                            `Tenant ID: ${property.currentTenantIdNumber}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Lease Start: {currentTenantHistory?.startDate ?
                            new Date(currentTenantHistory.startDate).toLocaleDateString() :
                            'N/A'}
                        </p>
                      </div>
                      {tenant && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                          {tenant.email && (
                            <div className="flex items-center gap-1 text-muted-foreground truncate">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{tenant.email}</span>
                            </div>
                          )}
                          {tenant.cellNumber && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{tenant.cellNumber}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {!property.currentTenantIdNumber && (property.status === 0 || property.status === "0") && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Current Tenant</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No current tenant</p>
            <p className="text-sm mt-1">Property is vacant</p>
          </CardContent>
        </Card>
      )}

      {/* Previous Tenants Section */}
      {property.tenantHistory && property.tenantHistory.filter(t => !t.isCurrent).length > 0 && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Previous Tenants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {property.tenantHistory.filter(t => !t.isCurrent).map((tenantHistory, index) => {
                  const tenant = tenants.get(tenantHistory.tenantIdNumber);

                  return (
                    <div key={index} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Avatar className="h-12 w-12 rounded-2xl flex-shrink-0">
                          <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground font-bold">
                            {tenant?.name && tenant?.surname ?
                              (tenant.name.charAt(0) + tenant.surname.charAt(0)).toUpperCase() :
                              tenantHistory.tenantIdNumber.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm">
                            {tenant?.name && tenant?.surname ?
                              `${tenant.name} ${tenant.surname}` :
                              `Tenant ID: ${tenantHistory.tenantIdNumber}`}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(tenantHistory.startDate).toLocaleDateString()} - {tenantHistory.endDate ? new Date(tenantHistory.endDate).toLocaleDateString() : 'Present'}
                          </p>
                          {tenant && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                              {tenant.email && (
                                <div className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{tenant.email}</span>
                                </div>
                              )}
                              {tenant.cellNumber && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{tenant.cellNumber}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {property.tenantHistory && property.tenantHistory.filter(t => !t.isCurrent).length === 0 && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Previous Tenants</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No previous tenants</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
