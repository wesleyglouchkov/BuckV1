"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Users, Loader2 } from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { ChannelInfo } from "@/components/live/ChannelInfo";
import { RecentHighlights, PreviousStreams } from "@/components/live/RecentHighlights";
import { useCreatorProfile } from "@/hooks/explore";

export default function CreatorPage({ params }: { params: Promise<{ creatorId: string }> }) {
    const { creatorId: creatorUsername } = use(params);
    const { data: session, status } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Use SWR hook for fetching creator data
    const {
        creator,
        latestStreams,
        previousStreams,
        totalStreams,
        totalPreviousStreams,
        isLoading,
        notFound,
        isError
    } = useCreatorProfile(creatorUsername);

    // Set page title
    useEffect(() => {
        if (creator?.username) {
            document.title = `@${creator.username} | Buck`;
        }
    }, [creator?.username]);

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

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {(notFound || isError) && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <p className="text-lg text-muted-foreground mb-4">
                            {notFound ? "Creator not found" : "Failed to load creator profile"}
                        </p>
                    </div>
                )}

                {!isLoading && !notFound && !isError && creator && (
                    <>
                        {/* Channel Info - Now includes bio, username, subscribers, subscription price */}
                        <ChannelInfo
                            creator={{
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar,
                                followers: creator.followers,
                                subscribers: creator.subscribers,
                                subscriptionPrice: creator.subscriptionPrice,
                                bio: creator.bio,
                                stripe_account_id: creator.stripe_account_id,
                                stripe_connected: creator.stripe_connected,
                                stripe_onboarding_completed: creator.stripe_onboarding_completed
                            }}
                        />

                        {/* Recent Highlights - Latest 4 streams */}
                        <RecentHighlights
                            creator={{
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar
                            }}
                            streams={latestStreams}
                            totalStreams={totalStreams}
                        />

                        {/* Previous Streams - from API directly */}
                        <PreviousStreams
                            creator={{
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar
                            }}
                            streams={previousStreams}
                            totalStreams={totalPreviousStreams}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
