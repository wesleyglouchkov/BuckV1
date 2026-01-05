"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, TrendingUp, Settings, User, ArrowLeftToLine, ArrowRightFromLine, Users, DollarSign, Calendar } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import HelpSupportSidebar from "@/components/HelpSupportSidebar";

const creatorMenu = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/creator/dashboard" },
  { icon: Calendar, label: "My Schedule", href: "/creator/schedule" },
  { icon: Users, label: "My Community", href: "/creator/community" },
  { icon: FileText, label: "My Streams", href: "/creator/content" },
  { icon: DollarSign, label: "Revenue", href: "/creator/revenue" },
  { icon: User, label: "Account Profile", href: "/creator/profile" },
];

export default function CreatorSidebar({ mobileOpen, setMobileOpen }: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isMobileOpen = mobileOpen ?? internalMobileOpen;
  const toggleMobile = setMobileOpen ? () => setMobileOpen(!isMobileOpen) : () => setInternalMobileOpen((v) => !v);

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/20 bg-card overflow-hidden shrink-0 transition-[width] duration-300 ease-out z-20 shadow-sm ${collapsed ? "w-16" : "w-64"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/20">
          <div className={`overflow-hidden ${collapsed ? "w-0" : "w-40"}`}>
            <p
              className={`text-xl font-bold text-foreground whitespace-nowrap transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100"
                }`}
            >
              Creator Studio
            </p>
          </div>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="ml-auto flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors"
          >
            {collapsed ? (
              <ArrowRightFromLine className="h-5 w-5 text-muted-foreground cursor-pointer" />
            ) : (
              <ArrowLeftToLine className="h-5 w-5 text-muted-foreground cursor-pointer" />
            )}
          </button>
        </div>

        <nav className="px-2 py-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {creatorMenu.map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href;
              const linkContent = (
                <Link
                  href={href}
                  className={`flex items-center ${collapsed ? 'justify-center px-2' : 'gap-2 px-2.5'} py-2 transition-colors ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <p className="text-sm font-medium">{label}</p>}
                </Link>
              );

              return (
                <li key={href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="p-4">
            <HelpSupportSidebar />
          </div>
        )}

      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out"
            onClick={toggleMobile}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border/20 shadow-sm transform transition-transform duration-300 ease-out animate-in slide-in-from-left flex flex-col">
            <div className="flex items-center gap-3 px-4 h-16 border-b border-border/20 shrink-0">
              <Link href="/explore" className="flex items-center" onClick={toggleMobile}>
                <Image
                  src="/buck.svg"
                  alt="Buck Logo"
                  width={40}
                  height={12}
                  className="dark:hidden"
                  priority
                />
                <Image
                  src="/buck-dark.svg"
                  alt="Buck Logo"
                  width={40}
                  height={12}
                  className="hidden dark:block"
                  priority
                />
              </Link>
              <Link
                href="/explore"
                className="text-base font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={toggleMobile}
              >
                Browse
              </Link>
            </div>
            <nav className="px-2 py-3 flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {creatorMenu.map(({ icon: Icon, label, href }) => {
                  const isActive = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={toggleMobile}
                        className={`flex items-center gap-2 rounded-none px-3 py-2 transition-colors ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <p className="text-sm font-medium">{label}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="p-4 mt-auto">
              <HelpSupportSidebar />
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
