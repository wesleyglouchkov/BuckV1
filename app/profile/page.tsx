"use client";
import { redirect } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import { useSession } from "next-auth/react";
import { useState } from "react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session) {
        redirect("/login");
    }

    const userRole = session.user?.role?.toLowerCase();
    const isCreator = userRole === 'creator';
    const isMember = userRole === 'member';

    const getRoleLabel = () => {
        const role = session?.user?.role.toLowerCase();
        if (!role) return "User";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getMenuItems = () => {
        if (isCreator) {
            return [
                { label: "Dashboard", href: "/creator/dashboard" },
                { label: "Profile", href: "/profile" },
                { label: "Settings", href: "/settings" },
            ];
        } else if (isMember) {
            return [
                { label: "Profile", href: "/profile" },
            ];
        }
        return [];
    };
    return (
        <div className={cn("pt-16", isMember)}>
            <OpenExploreNavbar
                session={session}
                status={status}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                roleLabel={getRoleLabel()}
                menuItems={getMenuItems()}
            />

            <div className="container dark:bg-background mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-2 font-bold">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Profile Section */}
                    <div className="lg:col-span-2">
                        <UserProfile />
                    </div>

                    {/* Sidebar - Role-specific info */}
                    <div className="space-y-6">
                        {/* Account Overview */}
                        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Account Overview
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Account Type</span>
                                    <span className="text-sm font-medium text-foreground capitalize">
                                        {session.user?.role || 'Member'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Creator-specific sidebar */}
                        {isCreator && (
                            <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-foreground mb-4">
                                    Creator Dashboard
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Quick Stats</p>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <div className="bg-background/50 rounded-md p-3">
                                                <p className="text-xs text-muted-foreground">Followers</p>
                                                <p className="text-xl font-bold text-foreground">0</p>
                                            </div>
                                            <div className="bg-background/50 rounded-md p-3">
                                                <p className="text-xs text-muted-foreground">Streams</p>
                                                <p className="text-xl font-bold text-foreground">0</p>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href="/creator/dashboard"
                                        className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                                    >
                                        Go to Creator Dashboard
                                    </a>
                                </div>
                            </div>
                        )}


                        {/* Help & Support */}
                        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Help & Support
                            </h2>
                            <div className="space-y-2">
                                <a
                                    href="/help"
                                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Help Center
                                </a>
                                <a
                                    href="/terms"
                                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="/privacy"
                                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
