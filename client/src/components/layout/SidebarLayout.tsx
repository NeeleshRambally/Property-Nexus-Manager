import { Link, useLocation, useRoute } from "wouter";
import React from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Files,
  Wrench,
  CircleDollarSign,
  MessageSquare,
  Settings,
  Bell,
  Search,
  UserCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Documents', href: '/documents', icon: Files },
  { name: 'Financials', href: '/financials', icon: CircleDollarSign },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [userEmail, setUserEmail] = React.useState("");

  React.useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#F2F2F7] dark:bg-black font-sans">
      {/* Desktop Sidebar */}
      <div className="w-72 bg-white dark:bg-[#1C1C1E] border-r border-black/5 dark:border-white/5 hidden md:flex flex-col z-10">
        <div className="h-20 flex items-center px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3 text-primary">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-black dark:text-white">RentAssured</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground ml-11">Powered by Jenna AI</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold' 
                      : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <item.icon className={`w-5 h-5`} />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-3 rounded-2xl transition-all">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src="/assets/images/avatar_1.jpg" />
                  <AvatarFallback>{userEmail ? userEmail.substring(0, 2).toUpperCase() : "LL"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold leading-none">{userEmail || "Landlord"}</span>
                  <span className="text-xs text-muted-foreground mt-1">Property Manager</span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-2xl p-2 shadow-2xl">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <Link href="/profile">
                <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer rounded-xl px-3 py-2"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userEmail");
                  window.location.href = "/login";
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* iOS style Header */}
        <header className="h-14 md:h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
          <h2 className="text-lg md:text-2xl font-bold tracking-tight md:hidden">
            {navigation.find(n => n.href === location)?.name || 'RentAssured'}
          </h2>
          
          <div className="w-96 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-10 h-10 bg-black/5 dark:bg-white/5 border-none rounded-xl focus-visible:ring-primary/20"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <button className="relative p-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
              </button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-24 md:pb-8 flex flex-col">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 w-full">
            {children}
          </div>
          <footer className="mt-auto py-8 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
            <p>© {new Date().getFullYear()} RentAssured • kimara jamun</p>
          </footer>
        </main>

        {/* iOS Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 px-6 flex items-center justify-between pb-safe z-50">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </a>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 text-muted-foreground">
                <Avatar className="h-6 w-6 border border-black/5">
                  <AvatarImage src="/assets/images/avatar_1.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-medium">Profile</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl mb-2">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <Link href="/profile">
                <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="text-destructive font-medium rounded-xl"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userEmail");
                  window.location.href = "/login";
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </div>
  );
}