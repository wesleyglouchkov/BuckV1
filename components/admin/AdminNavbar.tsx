"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { Session } from "next-auth";
import { Switch } from "@/components/ui";
import { getTheme, setTheme, initTheme } from "@/lib/theme";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface AdminNavbarProps {
  session: Session | null;
}

export default function AdminNavbar({ session }: AdminNavbarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    initTheme();
    setIsDarkMode(getTheme() === "dark");
  }, []);

  const toggleThemeHandler = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {menuItems.find(item => item.href === pathname)?.label || "Dashboard"}
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {session?.user?.name || session?.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Administrator
                    </p>
                  </div>
                  
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                    
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center gap-3 text-foreground">
                        {isDarkMode ? (
                          <Moon className="w-4 h-4" />
                        ) : (
                          <Sun className="w-4 h-4" />
                        )}
                        <span>Dark Mode</span>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleThemeHandler}
                        className="data-[state=checked]:bg-foreground"
                      />
                    </div>
                    
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
