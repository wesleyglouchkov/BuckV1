"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  ChevronDown,
  Menu
} from "lucide-react";
import { Session } from "next-auth";
import { Switch } from "@/components/ui";
import { getTheme, setTheme, initTheme } from "@/lib/theme";
import AdminSidebar from "./Sidebar";
import SignOutDialog from "@/components/SignOutDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Content & Moderation", href: "/admin/content" },
];

interface AdminNavbarProps {
  session: Session | null;
}

export default function AdminNavbar({ session }: AdminNavbarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initTheme();
    setIsDarkMode(getTheme() === "dark");
  }, []);

  // Close profile menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!showProfileMenu) return;

    const onDocClick = (e: MouseEvent) => {
      if (!profileWrapperRef.current) return;
      
      // Check if the click is on a dialog element
      const target = e.target as Element;
      const isDialogElement = target.closest('[data-radix-portal]') || 
                              target.closest('[role="dialog"]') ||
                              target.closest('[data-state]');
      
      // Don't close if clicking on dialog elements
      if (isDialogElement) return;
      
      if (!profileWrapperRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showProfileMenu]);

  const toggleThemeHandler = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  return (
    <>
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Top Navbar - Full Width Fixed */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 px-6 z-30 supports-backdrop-filter:bg-background/60">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden dark:text-white flex items-center justify-center w-9 h-9 hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-xl mt-2 font-semibold text-foreground">Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">{session?.user?.email}</p>
            <div className="relative" ref={profileWrapperRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-md border border-border/30 shadow-sm z-50 rounded-lg">
                  <div className="p-3 border-b border-border/50">
                    <p className="text-sm font-medium text-foreground">
                      {session?.user?.name || session?.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <p>View Profile</p>
                    </Link>
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center gap-3 text-foreground">
                        {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <p>Dark Mode</p>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleThemeHandler}
                        className="data-[state=checked]:bg-foreground"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await signOut({ callbackUrl: "/login", redirect: true });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <p>Sign Out</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
