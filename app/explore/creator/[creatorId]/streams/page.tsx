"use client";

import { useState, use, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    User,
    Users,
    Loader2,
    ArrowLeft,
    Grid3X3,
    List
} from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { ChannelInfo } from "@/components/live/ChannelInfo";
import { useCreatorStreams, useCreatorProfile } from "@/hooks/explore";
import Link from "next/link";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { getMenuItemsBasedOnRole } from "@/utils/menuItemsBasedOnRole";

const ITEMS_PER_PAGE = 12;

export default function CreatorStreamsPage({ params }: { params: Promise<{ creatorId: string }> }) {
    const { creatorId } = use(params);
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Filter State
    const initialIsLive = searchParams.get('isLive');
    const [isLiveFilter, setIsLiveFilter] = useState<string | null>(initialIsLive);
    const [page, setPage] = useState(1);

    // Automatically scroll to top when page changes
    useScrollToTop(page);

    // Fetch creator profile using the creatorId (which is actually username from the URL)
    const {
        creator,
        isLoading: isCreatorLoading,
        notFound: creatorNotFound
    } = useCreatorProfile(creatorId);

    // Use SWR hook for fetching streams - use actual creatorId if we have the creator
    const {
        streams,
        pagination,
        isLoading: isStreamsLoading,
        isError
    } = useCreatorStreams({
        creatorId: creator?.id || null,
        page,
        limit: ITEMS_PER_PAGE,
        isLive: isLiveFilter
    });

    const isLoading = isCreatorLoading || isStreamsLoading;

    // Thumbnails
    const signedThumbnails = useSignedThumbnails(streams.map(s => ({
        ...s,
        replayUrl: s.replayUrl || ""
    })));

    // Set page title
    useEffect(() => {
        if (creator?.username) {
            document.title = `@${creator.username}'s Streams | Buck`;
        }
    }, [creator?.username]);

    const menuItems = getMenuItemsBasedOnRole(session?.user?.role);

    const getRoleLabel = () => {
        const role = session?.user?.role?.toLowerCase();
        if (!role) return "User";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const handleFilterChange = (filter: string | null) => {
        setIsLiveFilter(filter);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-background">
            <OpenExploreNavbar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                session={session}
                status={status}
                roleLabel={getRoleLabel()}
                menuItems={menuItems}
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

            <main className={`pt-16 pb-8 transition-all duration-300 ease-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>

                {/* Loading State */}
                {isCreatorLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Not Found State */}
                {creatorNotFound && !isCreatorLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-muted-foreground mb-4">Creator not found</p>
                        <Link href="/explore">
                            <Button variant="outline" className="rounded-none">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Explore
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Main Content */}
                {!isCreatorLoading && !creatorNotFound && creator && (
                    <>
                        {/* Breadcrumb */}
                        <div className="px-6 py-4 border-b border-border/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link href="/explore" className="hover:text-foreground transition-colors">
                                    Explore
                                </Link>
                                <span>/</span>
                                <Link href={`/explore/creator/${creatorId}`} className="hover:text-foreground transition-colors">
                                    {creator.name}
                                </Link>
                                <span>/</span>
                                <span className="text-foreground">Streams</span>
                            </div>
                        </div>

                        {/* Use ChannelInfo component for reusability */}
                        <ChannelInfo
                            creator={{
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar,
                                followers: creator.followers,
                                subscribers: creator.subscribers,
                                subscriptionPrice: creator.subscriptionPrice,
                                bio: creator.bio
                            }}
                        />

                        {/* Streams Section */}
                        <div className="container max-w-7xl mx-auto px-6 py-8">
                            {/* Section Header with Filters */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Grid3X3 className="w-5 h-5" />
                                        {isLiveFilter === 'false' ? 'Previous Classes' :
                                            isLiveFilter === 'true' ? 'Live Streams' : 'All Streams'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {pagination?.total || 0} streams total
                                    </p>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex items-center gap-2 bg-muted/50 p-1">
                                    <Button
                                        variant={isLiveFilter === null ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-none text-xs dark:text-white"
                                        onClick={() => handleFilterChange(null)}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={isLiveFilter === 'true' ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-none text-xs dark:text-white"
                                        onClick={() => handleFilterChange('true')}
                                    >
                                        🔴 Live
                                    </Button>
                                    <Button
                                        variant={isLiveFilter === 'false' ? "default" : "ghost"}
                                        size="sm"
                                        className="rounded-none text-xs dark:text-white"
                                        onClick={() => handleFilterChange('false')}
                                    >
                                        Past
                                    </Button>
                                </div>
                            </div>

                            {/* Loading Streams */}
                            {isStreamsLoading && !isCreatorLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}

                            {/* Error State */}
                            {isError && !isLoading && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-lg text-muted-foreground mb-4">Failed to load streams</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && streams.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed border-border">
                                    <List className="w-12 h-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium text-foreground">No streams found</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isLiveFilter === 'true'
                                            ? `${creator.name} is not live right now.`
                                            : isLiveFilter === 'false'
                                                ? `${creator.name} doesn't have any previous streams yet.`
                                                : `${creator.name} hasn't streamed yet.`}
                                    </p>
                                </div>
                            )}

                            {/* Streams Grid */}
                            {!isLoading && !isError && streams.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {streams.map((stream) => (
                                            <VideoCard
                                                key={stream.id}
                                                stream={stream}
                                                signedThumbnailUrl={signedThumbnails[stream.id]}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {pagination && pagination.totalPages > 1 && (
                                        <div className="mt-12 p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                                Page {pagination.page} of {pagination.totalPages}
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
                                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                                    disabled={page === pagination.totalPages}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
