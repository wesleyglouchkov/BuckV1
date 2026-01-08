"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, Users } from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";

export default function MyCreatorsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = "My Creators | Buck";
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const getMenuItems = () => {
        const role = session?.user?.role?.toLowerCase();

        if (role === "admin") {
            return [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }];
        }
        if (role === "creator") {
            return [{ label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard }];
        }
        if (role === "member") {
            return [
                { label: "View Profile", href: "/profile", icon: User },
                { label: "My Creators", href: "/my-creators", icon: Users }
            ];
        }
        return [];
    };

    const getRoleLabel = () => {
        const role = session?.user?.role?.toLowerCase();
        if (!role) return "User";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    // Show loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <OpenExploreNavbar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                session={session}
                status={status}
                roleLabel={getRoleLabel()}
                menuItems={getMenuItems()}
            />

            <ExploreSidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                categoriesExpanded={categoriesExpanded}
                setCategoriesExpanded={setCategoriesExpanded}
                showAllCategories={showAllCategories}
                setShowAllCategories={setShowAllCategories}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <main className={`pt-16 pb-8 transition-all duration-300 ease-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"
                }`}>
                <div className="md:hidden h-16" />

                <div className="max-w-7xl mx-auto px-6">
                    {/* Page Header */}
                    <section className="mt-8 mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">My Creators</h1>
                        <p className="text-muted-foreground">
                            Creators you follow and subscribe to
                        </p>
                    </section>

                    {/* Empty State */}
                    <section className="mb-12">
                        <div className="bg-card border border-border/40 p-12 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No creators yet
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Start exploring and follow your favorite creators to see them here.
                            </p>
                            <button
                                onClick={() => router.push("/explore?tab=creators")}
                                className="px-6 cursor-pointer py-2.5 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                            >
                                Explore Creators
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
