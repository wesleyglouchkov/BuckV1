"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  User
} from "lucide-react";
import { Session } from "next-auth";
import AdminSidebar from "./Sidebar";
import UserMenu from "../UserMenu";

interface AdminNavbarProps {
  session: Session | null;
}

export default function AdminNavbar({ session }: AdminNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Top Navbar - Full Width Fixed */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 px-3 z-30 supports-backdrop-filter:bg-background/60">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden  cursor-pointer dark:text-white flex items-center justify-center w-9 h-9 hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Link href="/explore" className="flex items-center">
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
              >
                Browse
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">{session?.user?.email}</p>
            <UserMenu
              session={session}
              roleLabel="Administrator"
              menuItems={[
                { label: "View Profile", href: "/admin/profile", icon: User }
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
