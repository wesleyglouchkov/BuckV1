"use client";

import { useState, use } from "react";
import { useSession } from "next-auth/react";
import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    LayoutDashboard,
    User,
    Users
} from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";

// Mock Data Generator (Reused and expanded from RecentHighlights logic)
const generateMockStreams = (creatorId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `stream-${i}`,
        title: i % 3 === 0 ? "Highlight: Unbelievable Moments" : (i % 3 === 1 ? "Full Stream: Late Night Chill" : "Gaming with Subs"),
        thumbnail: null,
        replayUrl: "creators/cmjfamzp500084ou644652eeu/streams/cmk1dzqx50004anu6erl3zmbu/040383ba70415d6a5dec60972408a3c8_cmk1dzqx50004anu6erl3zmbu_0.mp4",
        createdAt: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString(),
        duration: 3600 + Math.random() * 7200,
        viewerCount: Math.floor(Math.random() * 50000),
        views: Math.floor(Math.random() * 100000),
        isLive: false,
        creator: {
            id: creatorId,
            name: "Creator Name",
            avatar: null
        }
    }));
};

const ITEMS_PER_PAGE = 12;

export default function CreatorStreamsPage({ params }: { params: Promise<{ creatorId: string }> }) {
    const { creatorId } = use(params);
    const { data: session, status } = useSession();

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Page State
    const [page, setPage] = useState(1);

    // Mock Data
    const allStreams = generateMockStreams(creatorId, 48);

    // Pagination Logic
    const totalPages = Math.ceil(allStreams.length / ITEMS_PER_PAGE);
    const paginatedStreams = allStreams.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Thumbnails
    const signedThumbnails = useSignedThumbnails(paginatedStreams);

    const getMenuItems = () => {
        const role = session?.user?.role?.toLowerCase();
        if (role === "admin") return [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }];
        if (role === "creator") return [{ label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard }];
        if (role === "member") return [
            { label: "View Profile", href: "/profile", icon: User },
            { label: "My Creators", href: "/my-creators", icon: Users }
        ];
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                session={session}
                status={status}
                roleLabel={getRoleLabel()}
                menuItems={getMenuItems()}
            />

            {/* Mobile Search */}
            <div className="md:hidden fixed top-16 left-0 right-0 bg-card border-b border-border/20 p-4 z-20">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search creator, class..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-input border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    />
                </div>
            </div>

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

            <main className={`pt-16 pb-8 transition-all duration-300 ease-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
                <div className="md:hidden h-16" />

                <div className="container py-8 max-w-7xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-foreground font-heading tracking-tight">Recent Highlights & Uploads</h1>
                        <p className="text-muted-foreground">Catch up on all recent streams and highlighted moments.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedStreams.map((stream) => (
                            <VideoCard
                                key={stream.id}
                                stream={stream}
                                signedThumbnailUrl={signedThumbnails[stream.id]}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none disabled:opacity-30 border-border/40 hover:bg-primary hover:text-white transition-all p-2 h-9 w-9"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none disabled:opacity-30 border-border/40 hover:bg-primary hover:text-white transition-all p-2 h-9 w-9"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
