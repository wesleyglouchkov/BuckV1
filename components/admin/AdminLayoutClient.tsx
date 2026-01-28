"use client";

import { Session } from "next-auth";
import { AdminNavbar } from "@/components/admin";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

function AdminLayoutContent({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar session={session} />
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <main className="pt-16">{children}</main>
      </div>
    </div>
  );
}

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent session={session}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}
