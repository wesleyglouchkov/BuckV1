"use client";

import { useState } from "react";
import {
  Menu,
  User
} from "lucide-react";
import { Session } from "next-auth";
import CreatorSidebar from "./Sidebar";
import UserMenu from "../UserMenu";
import BuckLogo from "../BuckLogo";

interface CreatorNavbarProps {
  session: Session | null;
  isLivePage?: boolean;
}

export default function CreatorNavbar({ session, isLivePage = false }: CreatorNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // On live page, render nothing (fullscreen mode)
  if (isLivePage) {
    return null;
  }

  return (
    <>
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Top Navbar - Full Width Fixed */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 px-3 z-30 supports-backdrop-filter:bg-background/60">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden cursor-pointer dark:text-white flex items-center justify-center w-9 h-9 hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BuckLogo  />

          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">{session?.user?.email}</p>
            <UserMenu
              session={session}
              roleLabel="Creator"
              menuItems={[
                { label: "View Profile", href: "/creator/profile" }
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
