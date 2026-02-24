import React from "react";
import { Link } from "wouter";
import { Building2, MapPin, Bed, Bath, Maximize, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddPropertyModal } from "@/components/AddPropertyModal";
import { apiClient } from "@/lib/api";

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
}

export default function Properties() {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProperties = React.useCallback(async () => {
    const landlordIdNumber = localStorage.getItem("landlordIdNumber");
    if (!landlordIdNumber) return;

    try {
      const response = await apiClient.get(`/api/landlords/${landlordIdNumber}/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProperties();

    // Listen for new properties
    const handleNewProperty = () => fetchProperties();
    window.addEventListener("propertyCreated", handleNewProperty);
    return () => window.removeEventListener("propertyCreated", handleNewProperty);
  }, [fetchProperties]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Portfolio Management</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Properties</h1>
        </div>
        <AddPropertyModal />
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No properties yet</p>
          <p className="text-sm mt-1">Click the + button to add your first property</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group">
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="rounded-full shadow-lg">
                      {property.propertyType || "Property"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Address */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {property.address}
                    </h3>
                    {(property.city || property.province) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {[property.city, property.province].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {property.numberOfBedrooms !== undefined && property.numberOfBedrooms !== null && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bed className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Beds</p>
                          <p className="text-sm font-bold">{property.numberOfBedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.numberOfBathrooms !== undefined && property.numberOfBathrooms !== null && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Bath className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Baths</p>
                          <p className="text-sm font-bold">{property.numberOfBathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.squareMeters !== undefined && property.squareMeters !== null && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Maximize className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">m²</p>
                          <p className="text-sm font-bold">{property.squareMeters}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monthly Rent */}
                  {property.monthlyRent !== undefined && property.monthlyRent !== null && (
                    <div className="pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Monthly Rent
                        </span>
                        <span className="text-xl font-bold text-primary">
                          R {property.monthlyRent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
