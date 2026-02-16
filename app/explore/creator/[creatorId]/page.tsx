"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Users, Loader2, Calendar, Film, Info } from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { ChannelInfo } from "@/components/live/ChannelInfo";
import { RecentHighlights, PreviousStreams } from "@/components/live/RecentHighlights";
import { useCreatorProfile, useCreatorScheduledStreams, ScheduledStream } from "@/hooks/explore";
import { cn } from "@/lib/utils";
import PublicStreamDetailsDialog from "@/components/schedule/PublicStreamDetailsDialog";
import { format } from "date-fns";
import { getMenuItemsBasedOnRole } from "@/utils/menuItemsBasedOnRole";

type TabType = "about" | "schedule" | "past";

export default function CreatorPage({ params }: { params: Promise<{ creatorId: string }> }) {
    const { creatorId: creatorUsername } = use(params);
    const { data: session, status } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("about");
    const [selectedStream, setSelectedStream] = useState<ScheduledStream | null>(null);
    const [showStreamDialog, setShowStreamDialog] = useState(false);

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

    // Fetch scheduled streams when on schedule tab
    const {
        streams: scheduledStreams,
        isLoading: isScheduleLoading,
        pagination: schedulePagination
    } = useCreatorScheduledStreams({
        creatorId: creator?.id || null,
        limit: 10
    });

    // Set page title
    useEffect(() => {
        if (creator?.username) {
            document.title = `@${creator.username} | Buck`;
        }
    }, [creator?.username]);

    const menuItems = getMenuItemsBasedOnRole(session?.user?.role);

    const getRoleLabel = () => {
        const role = session?.user?.role?.toLowerCase();
        if (!role) return "User";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const tabs = [
        { id: "about" as TabType, label: "About", icon: Info },
        { id: "schedule" as TabType, label: "Schedule", icon: Calendar },
        { id: "past" as TabType, label: "Past Streams", icon: Film },
    ];

    const handleSelectScheduledStream = (stream: ScheduledStream) => {
        setSelectedStream(stream);
        setShowStreamDialog(true);
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
                        {/* Channel Info - Header with avatar, name, etc */}
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

                                stripe_connected: creator.stripe_connected,
                                stripe_onboarding_completed: creator.stripe_onboarding_completed
                            }}
                        />

                        {/* Tabs */}
                        <div className="px-6 border-b border-border">
                            <div className="flex gap-1 overflow-x-auto scrollbar-none">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer",
                                            activeTab === tab.id
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span className="mt-0.5">{tab.label}</span>
                                        {/* Active indicator */}
                                        <div
                                            className={cn(
                                                "absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300",
                                                activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content with Slide Animation */}
                        <div className="relative overflow-hidden">
                            <div
                                className="flex transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translateX(-${tabs.findIndex(t => t.id === activeTab) * 100}%)`
                                }}
                            >
                                {/* About Tab */}
                                <div className="w-full shrink-0">
                                    <div className="px-6 py-6">
                                        <div className="max-w-3xl">
                                            <h2 className="text-lg font-semibold mb-4 text-foreground">About</h2>
                                            {creator.bio ? (
                                                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                                    {creator.bio}
                                                </p>
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    This creator hasn&apos;t added a bio yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>

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
                                </div>

                                {/* Schedule Tab */}
                                <div className="w-full shrink-0 px-6 py-6">
                                    <h2 className="text-lg font-semibold mb-4 text-foreground">Upcoming Streams</h2>

                                    {isScheduleLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    ) : scheduledStreams.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">No upcoming streams scheduled</p>
                                            <p className="text-sm text-muted-foreground/70 mt-1">
                                                Follow to get notified when they go live!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 max-w-3xl">
                                            {scheduledStreams.map((stream) => {
                                                const startDate = new Date(stream.startTime);
                                                const isToday = new Date().toDateString() === startDate.toDateString();

                                                return (
                                                    <button
                                                        key={stream.id}
                                                        onClick={() => handleSelectScheduledStream(stream)}
                                                        className="cursor-pointer flex items-center gap-4 p-4 bg-card border border-border hover:border-primary/50 transition-all group text-left w-full"
                                                    >
                                                        {/* Date Badge */}
                                                        <div className={cn(
                                                            "shrink-0 w-14 h-14 flex flex-col items-center justify-center",
                                                            isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                                        )}>
                                                            <span className="text-xs font-medium uppercase">
                                                                {format(startDate, "MMM")}
                                                            </span>
                                                            <span className="text-xl font-bold leading-none">
                                                                {format(startDate, "d")}
                                                            </span>
                                                        </div>

                                                        {/* Stream Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                                {stream.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                                <span>{format(startDate, "h:mm a")}</span>
                                                                {stream.workoutType && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{stream.workoutType}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Today Badge */}
                                                        {isToday && (
                                                            <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-1">
                                                                Today
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}

                                            {schedulePagination && schedulePagination.total > scheduledStreams.length && (
                                                <p className="text-center text-sm text-muted-foreground mt-4">
                                                    + {schedulePagination.total - scheduledStreams.length} more scheduled
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Past Streams Tab */}
                                <div className="w-full shrink-0 pt-6">
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
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Stream Details Dialog */}
            <PublicStreamDetailsDialog
                open={showStreamDialog}
                onOpenChange={setShowStreamDialog}
                stream={selectedStream}
            />
        </div>
    );
}
