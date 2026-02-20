import { useLocation, Link } from "wouter";
import { Building2, ArrowRight, Mail, Lock, User, Phone, IdCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import React from "react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    idNumber: "",
    name: "",
    surname: "",
    email: "",
    cellNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.idNumber || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields (ID Number, Email, Password).",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/api/auth/signup", {
        idNumber: formData.idNumber,
        name: formData.name || undefined,
        surname: formData.surname || undefined,
        email: formData.email,
        cellNumber: formData.cellNumber || undefined,
        password: formData.password,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store auth token and user info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("landlordIdNumber", data.idNumber);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Welcome to RentAssured!",
        description: "Your account has been created successfully.",
      });

      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">RentAssured</h1>
          <p className="text-muted-foreground mt-2">The modern operating system for landlords.</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 bg-white/70 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-display tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-center">
              Register as a landlord to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="Your ID number"
                    className="pl-10 bg-white/50 focus-visible:ring-primary/20"
                    value={formData.idNumber}
                    onChange={handleChange("idNumber")}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="First name"
                      className="pl-10 bg-white/50 focus-visible:ring-primary/20"
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
                    className="bg-white/50 focus-visible:ring-primary/20"
                    value={formData.surname}
                    onChange={handleChange("surname")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 bg-white/50 focus-visible:ring-primary/20"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cellNumber">Cell Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cellNumber"
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    className="pl-10 bg-white/50 focus-visible:ring-primary/20"
                    value={formData.cellNumber}
                    onChange={handleChange("cellNumber")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-white/50 focus-visible:ring-primary/20"
                    value={formData.password}
                    onChange={handleChange("password")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-white/50 focus-visible:ring-primary/20"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-6 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-6 pb-6">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link href="/login"><a className="text-primary font-medium hover:underline transition-all">Sign in</a></Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
