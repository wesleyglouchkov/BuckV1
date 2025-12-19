"use client";

import { Session } from "next-auth";
import { CreatorNavbar } from "@/components/creator";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { usePathname } from "next/navigation";

function CreatorLayoutContent({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isLivePage = pathname.includes("/creator/live");

  return (
    <div className="min-h-screen bg-background">
      <CreatorNavbar session={session} isLivePage={isLivePage} />
      <div className={`transition-all duration-300 ${isLivePage ? '' : (collapsed ? 'sm:ml-16' : 'sm:ml-64')}`}>
        <main className={isLivePage ? '' : 'pt-16'}>{children}</main>
      </div>
    </div>
  );
}

interface CreatorLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function CreatorLayoutClient({ children, session }: CreatorLayoutClientProps) {
  return (
    <SidebarProvider>
      <CreatorLayoutContent session={session}>
        {children}
      </CreatorLayoutContent>
    </SidebarProvider>
  );
}
