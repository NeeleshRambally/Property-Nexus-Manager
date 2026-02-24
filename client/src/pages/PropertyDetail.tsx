import React from "react";
import { useRoute, useLocation } from "wouter";
import { Building2, MapPin, Bed, Bath, Maximize, DollarSign, ArrowLeft, Edit, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PropertyDetail() {
  const [, params] = useRoute("/properties/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [isAddingImage, setIsAddingImage] = React.useState(false);

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

  React.useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleAddImage = async () => {
    if (!newImageUrl || !property) return;

    setIsAddingImage(true);
    try {
      const updatedImages = [...property.images, newImageUrl];

      const response = await apiClient.put(`/api/properties/${property.id}`, {
        address: property.address,
        city: property.city,
        province: property.province,
        postalCode: property.postalCode,
        propertyType: property.propertyType,
        numberOfBedrooms: property.numberOfBedrooms,
        numberOfBathrooms: property.numberOfBathrooms,
        squareMeters: property.squareMeters,
        monthlyRent: property.monthlyRent,
      });

      if (response.ok) {
        // For now, just update local state. Backend needs images field in update
        setProperty({...property, images: updatedImages});
        setNewImageUrl("");
        toast({
          title: "Success",
          description: "Image URL added. Note: Full image upload coming soon!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add image.",
      });
    } finally {
      setIsAddingImage(false);
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
        <Badge className="rounded-full">{property.propertyType || "Property"}</Badge>
      </div>

      {/* Images Section */}
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Property Images</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image URL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Image URL</DialogTitle>
                  <DialogDescription>
                    Enter the URL of an image to add to this property.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddImage} disabled={isAddingImage || !newImageUrl}>
                    {isAddingImage ? "Adding..." : "Add Image"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {property.images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 group">
                  <img
                    src={imageUrl}
                    alt={`${property.address} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No images yet</p>
              <p className="text-xs mt-1">Click "Add Image URL" to add photos</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
