import { 
  Building2, 
  Users, 
  AlertCircle, 
  Wrench, 
  FileText,
  UserPlus,
  ArrowRight,
  Download,
  Eye,
  Upload,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your properties today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
              <p className="text-3xl font-display font-semibold">12</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
              <p className="text-3xl font-display font-semibold">48</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rent Due</p>
              <p className="text-3xl font-display font-semibold text-destructive">$4,250</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
              <p className="text-3xl font-display font-semibold">3</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Wrench className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Properties Table */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="text-lg">Property Portfolio</CardTitle>
              <CardDescription>Recent status of your managed units</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Property</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Tenants</th>
                    <th className="px-6 py-3">Rent Due</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src="/src/assets/images/property-1.jpg" alt="Property" className="w-10 h-10 rounded-md object-cover" />
                        <div className="font-medium text-foreground">123 Horizon Ave, Apt 4B</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-medium">Occupied</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">2</td>
                    <td className="px-6 py-4 text-muted-foreground">-</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="font-medium text-foreground">789 Maple St, Unit 2</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Vacant</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">0</td>
                    <td className="px-6 py-4 text-muted-foreground">-</td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-white gap-1" data-testid="btn-request-screening">
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Screening</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Request Tenant Screening</DialogTitle>
                            <DialogDescription>
                              Send a screening application to a prospective tenant for 789 Maple St.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Applicant Name</Label>
                              <Input id="name" placeholder="John Smith" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Applicant Email</Label>
                              <Input id="email" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2 pt-2">
                              <p className="text-sm font-medium">Checks to perform:</p>
                              <div className="space-y-2 mt-2">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                  <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4" defaultChecked />
                                  Credit History Check
                                </label>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                  <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4" defaultChecked />
                                  Criminal Background Check
                                </label>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                  <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4" defaultChecked />
                                  Eviction History
                                </label>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" data-testid="btn-submit-screening">Send Request</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="font-medium text-foreground">456 Oak Lane, Suite 1</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-medium">Occupied</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">1</td>
                    <td className="px-6 py-4 font-medium text-destructive">$1,250 (Late)</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Management Panel */}
        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg">Current Tenants</CardTitle>
            <CardDescription>Recent tenant activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/50">
              
              <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/src/assets/images/avatar_2.jpg" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Sarah Miller</p>
                    <p className="text-xs text-muted-foreground">123 Horizon Ave, 4B</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Docs
                </Button>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/src/assets/images/avatar_3.jpg" />
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">456 Oak Lane, Ste 1</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Docs
                </Button>
              </div>

            </div>
          </CardContent>
          <div className="p-4 border-t border-border/50 mt-auto">
            <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary hover:bg-primary/5">
              View All Tenants <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Document Center */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Document Center</CardTitle>
                <CardDescription>Manage leases, insurance, and tax documents</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Upload Document
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Landlord Docs */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Landlord Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">2024 Property Insurance</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Updated 2 days ago • PDF</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">LLC Tax Form 1099</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Updated Jan 15 • PDF</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tenant Docs */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Recent Tenant Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Signed Lease - 123 Horizon Ave</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Sarah Miller • Signed Today</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Background Check Results</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Applicant: J. Smith • Pending Review</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}