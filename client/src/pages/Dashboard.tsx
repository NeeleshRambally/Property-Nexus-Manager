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
  FileCheck,
  Plus
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Portfolio Insights</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Overview</h1>
        </div>
        <div className="hidden md:block">
          <Button variant="outline" className="rounded-full px-6 h-11 border-black/10 hover:bg-black/5 transition-all">
            Download Report
          </Button>
        </div>
      </div>

      {/* Summary Cards - iOS Grid style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden active:scale-95 transition-transform duration-200">
          <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full min-h-[120px]">
            <div className="w-10 h-10 rounded-2xl bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center text-primary mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Properties</p>
              <p className="text-2xl font-bold tracking-tight">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden active:scale-95 transition-transform duration-200">
          <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full min-h-[120px]">
            <div className="w-10 h-10 rounded-2xl bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center text-[#34C759] mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tenants</p>
              <p className="text-2xl font-bold tracking-tight">48</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden active:scale-95 transition-transform duration-200">
          <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full min-h-[120px]">
            <div className="w-10 h-10 rounded-2xl bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rent Due</p>
              <p className="text-2xl font-bold tracking-tight text-[#FF3B30]">$4.2k</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden active:scale-95 transition-transform duration-200">
          <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full min-h-[120px]">
            <div className="w-10 h-10 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500] mb-3">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tickets</p>
              <p className="text-2xl font-bold tracking-tight">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Properties Table - iOS List Style */}
        <Card className="lg:col-span-2 border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Properties</CardTitle>
                <CardDescription className="text-xs">Manage your portfolio units</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary text-sm font-semibold hover:bg-primary/5 rounded-full px-4">
                See All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {[
                { address: "123 Horizon Ave, Apt 4B", status: "Occupied", tenants: 2, rent: "-", img: "/src/assets/images/property-1.jpg" },
                { address: "789 Maple St, Unit 2", status: "Vacant", tenants: 0, rent: "-", img: null },
                { address: "456 Oak Lane, Suite 1", status: "Occupied", tenants: 1, rent: "$1,250", alert: true }
              ].map((prop, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer active:bg-black/[0.05]">
                  <div className="flex items-center gap-4">
                    {prop.img ? (
                      <img src={prop.img} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-center text-muted-foreground">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm leading-tight mb-1">{prop.address}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 border-none ${
                          prop.status === 'Occupied' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
                        }`}>
                          {prop.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{prop.tenants} Tenants</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {prop.alert && <span className="text-xs font-bold text-[#FF3B30]">{prop.rent}</span>}
                    {prop.status === 'Vacant' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 rounded-full bg-primary text-white text-xs font-bold px-4" data-testid={`btn-screen-${i}`}>
                            Screen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[32px] border-none shadow-2xl sm:max-w-md p-8">
                          <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight">Vetting Request</DialogTitle>
                            <DialogDescription className="text-sm">
                              Initiate tenant screening for {prop.address}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Applicant Details</Label>
                              <Input placeholder="Full Name" className="h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none px-4" />
                              <Input placeholder="Email Address" className="h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border-none px-4 mt-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex flex-col items-center justify-center gap-2">
                                <FileCheck className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-bold uppercase">Credit</span>
                              </div>
                              <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex flex-col items-center justify-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-bold uppercase">Criminal</span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20">Send Application</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Tenants */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-lg font-bold">Recent Tenants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {[
                { name: "Sarah Miller", unit: "123 Horizon Ave, 4B", img: "/src/assets/images/avatar_2.jpg" },
                { name: "Robert Johnson", unit: "456 Oak Lane, Ste 1", img: "/src/assets/images/avatar_3.jpg" }
              ].map((tenant, i) => (
                <div key={i} className="p-5 flex items-center justify-between group active:bg-black/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 rounded-2xl border-2 border-white dark:border-[#1C1C1E] shadow-sm">
                      <AvatarImage src={tenant.img} />
                      <AvatarFallback className="rounded-2xl">{tenant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm leading-tight">{tenant.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-0.5">{tenant.unit}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary">
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-6 pt-2">
            <Button variant="outline" className="w-full h-12 rounded-[18px] border-black/5 dark:border-white/5 text-sm font-bold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/5 border-none">
              View Directory
            </Button>
          </div>
        </Card>
      </div>

      {/* iOS Style Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#1C1C1E] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Property Docs</h3>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3">
             <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-black rounded-xl shadow-sm">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-bold">Insurance 2024</span>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
             </div>
             <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-black rounded-xl shadow-sm">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-bold">Tax Form 1099</span>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
             </div>
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#1C1C1E] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Tenant Docs</h3>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3">
             <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-black rounded-xl shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold">Lease - Sarah M.</span>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
             </div>
             <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-black rounded-xl shadow-sm">
                    <FileText className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm font-bold">BG Check - John S.</span>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}