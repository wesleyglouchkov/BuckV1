"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Users } from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { ChannelInfo } from "@/components/live/ChannelInfo";
import { RecentHighlights } from "@/components/live/RecentHighlights";

// Mock creator data (replace with actual API call)
const mockCreators: Record<string, {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    followers: number;
    category: string;
    bio?: string;
    lastLive?: string;
}> = {
    "fitcoach": {
        id: "fitcoach",
        name: "FitCoach",
        username: "fitcoach",
        avatar: undefined,
        followers: 54000,
        category: "HIIT",
        bio: "Professional fitness coach specializing in HIIT and strength training.",
        lastLive: "2 days ago"
    },
    "yogamaster": {
        id: "yogamaster",
        name: "YogaMaster",
        username: "yogamaster",
        avatar: undefined,
        followers: 32000,
        category: "Yoga",
        bio: "Certified yoga instructor with 10+ years of experience.",
        lastLive: "5 days ago"
    },
    "hiitqueen": {
        id: "hiitqueen",
        name: "HIITQueen",
        username: "hiitqueen",
        avatar: undefined,
        followers: 89000,
        category: "HIIT",
        bio: "High-intensity interval training specialist.",
        lastLive: "1 day ago"
    },
};

export default function CreatorPage() {
    const params = useParams();
    const creatorId = params.creatorId as string;
    const { data: session, status } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Get creator data
    const creator = mockCreators[creatorId] || {
        id: creatorId,
        name: creatorId,
        username: creatorId,
        followers: 0,
        category: "Unknown",
        lastLive: "Unknown"
    };

    // Set page title
    useEffect(() => {
        document.title = `${creator.name} | Buck`;
    }, [creator.name]);

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
                {/* Channel Info */}
                <ChannelInfo
                    creator={{
                        id: creator.id,
                        name: creator.name,
                        avatar: creator.avatar,
                        followers: creator.followers
                    }}
                    lastLive={creator.lastLive}
                />

                {/* Creator Bio */}
                {creator.bio && (
                    <div className="px-6 mb-6">
                        <div className="bg-card border border-border p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                            <p className="text-sm text-muted-foreground">{creator.bio}</p>
                            <div className="mt-3 flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Category: </span>
                                    <span className="font-medium text-primary">{creator.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Highlights */}
                <RecentHighlights
                    creator={{
                        id: creator.id,
                        name: creator.name,
                        avatar: creator.avatar
                    }}
                />
            </main>
        </div>
    );
}
