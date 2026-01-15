
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Heart,
    Star,
    Eye,
    UserX,
    LayoutDashboard,
    User,
    Users,
    Video
} from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/utils/dateTimeUtils";
import { UnsubscribeDialog } from "@/components/live/subscribe/UnsubscribeDialog";
import { useMyFollowing, useMySubscriptions } from "@/hooks/member";
import { memberService } from "@/services/member";
import { toast } from "sonner";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export default function MyCreatorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Page State
    const [activeTab, setActiveTab] = useState("subscribed");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [followingPage, setFollowingPage] = useState(1);
    const [subscriptionsPage, setSubscriptionsPage] = useState(1);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            // Reset pages when search changes
            setFollowingPage(1);
            setSubscriptionsPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data using SWR hooks
    const {
        following,
        pagination: followingPagination,
        isLoading: isFollowingLoading,
        isError: isFollowingError,
        mutate: mutateFollowing
    } = useMyFollowing({
        page: followingPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch
    });

    const {
        subscriptions,
        pagination: subscriptionsPagination,
        isLoading: isSubscriptionsLoading,
        isError: isSubscriptionsError,
        mutate: mutateSubscriptions
    } = useMySubscriptions({
        page: subscriptionsPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch
    });

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

    const handleUnfollow = async (followId: string) => {
        try {
            await memberService.unfollowCreator(followId);
            toast.success("Unfollowed successfully");
            mutateFollowing();
        } catch (error: any) {
            toast.error(error.message || "Failed to unfollow");
        }
    };

    const handleUnsubscribe = async (subscriptionId: string) => {
        try {
            await memberService.unsubscribeFromCreator(subscriptionId);
            toast.success("Unsubscribed successfully");
            mutateSubscriptions();
        } catch (error: any) {
            toast.error(error.message || "Failed to unsubscribe");
        }
    };

    // Get current data based on active tab
    const currentList = activeTab === "following" ? following : subscriptions;
    const isLoading = activeTab === "following" ? isFollowingLoading : isSubscriptionsLoading;
    const isError = activeTab === "following" ? isFollowingError : isSubscriptionsError;
    const pagination = activeTab === "following" ? followingPagination : subscriptionsPagination;
    const currentPage = activeTab === "following" ? followingPage : subscriptionsPage;
    const setPage = activeTab === "following" ? setFollowingPage : setSubscriptionsPage;

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

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">My Creators</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage the creators you follow and your active subscriptions.
                        </p>
                    </div>

                    <Tabs defaultValue="subscribed" className="w-full" onValueChange={(v) => {
                        setActiveTab(v);
                    }}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <TabsList className="bg-muted/50 p-1 h-12 rounded-none border border-border/20">
                                <TabsTrigger
                                    value="subscribed"
                                    className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                                >
                                    <Star className="w-4 h-4" />
                                    Subscribed
                                    {subscriptionsPagination && (
                                        <span className="text-xs text-muted-foreground">({subscriptionsPagination.total})</span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="following"
                                    className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                                >
                                    <Heart className="w-4 h-4" />
                                    Following
                                    {followingPagination && (
                                        <span className="text-xs text-muted-foreground">({followingPagination.total})</span>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search creators..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-12 rounded-none bg-card border-border/20 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Shared Table Container */}
                        <div className="bg-card border border-border/20 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/10 hover:bg-transparent">
                                        <TableHead className="w-[300px]">Creator</TableHead>
                                        <TableHead>{activeTab === "following" ? "Followed Since" : "Renewal Date"}</TableHead>
                                        <TableHead>Profile</TableHead>
                                        <TableHead>Classes</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <TableRow key={i} className="border-border/10">
                                                <TableCell><div className="h-10 bg-muted animate-pulse w-full" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-24" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : isError ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <p className="text-lg font-medium text-destructive">Failed to load data</p>
                                                    <p className="text-sm">Please try again later.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : currentList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    {activeTab === "following" ? <UserX className="w-12 h-12 mb-4 opacity-20" /> : <Star className="w-12 h-12 mb-4 opacity-20" />}
                                                    <p className="text-lg font-medium">No results found</p>
                                                    <p className="text-sm">You haven't {activeTab === "following" ? "followed anyone" : "subscribed to anyone"} yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentList.map((item: any) => (
                                            <TableRow key={item.id} className="border-border/10 hover:bg-muted/10 transition-colors">
                                                {/* Creator Cell */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar src={item?.creator?.avatar} name={item.creator.name} className="w-10 h-10" />
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">{item.creator.name}</span>
                                                            <span className="text-xs text-muted-foreground font-bold">@{item.creator.username}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>



                                                {/* Date Cell */}
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(activeTab === "following" ? item.followedAt : item.renewalDate)}
                                                </TableCell>

                                                {/* Profile View Cell */}
                                                <TableCell>
                                                    <Link href={`/explore/creator/${item.creator.username}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-none text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all text-xs gap-2"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span className="mt-1">Go to Profile</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>

                                                {/* Classes Cell */}
                                                <TableCell>
                                                    <Link href={`/explore/creator/${item.creator.username}/streams`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-none text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 transition-all text-xs gap-2"
                                                        >
                                                            <Video className="w-3.5 h-3.5" />
                                                            <span className="mt-1">View Classes</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>

                                                {/* Action Cell */}
                                                <TableCell className="text-right">
                                                    {activeTab === "following" ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUnfollow(item.id)}
                                                            className="rounded-none border-border/40 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                                                        >
                                                            Unfollow
                                                        </Button>
                                                    ) : (
                                                        <UnsubscribeDialog
                                                            creator={item.creator}
                                                            onConfirm={() => handleUnsubscribe(item.id)}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-none border-border/40 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                                                            >
                                                                Unsubscribe
                                                            </Button>
                                                        </UnsubscribeDialog>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Area */}
                            {!isLoading && pagination && pagination.totalPages > 1 && (
                                <div className="p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                        Page {currentPage} of {pagination.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-none disabled:opacity-30 border-border/40 hover:bg-primary hover:text-white transition-all p-2 h-9 w-9"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-none disabled:opacity-30 border-border/40 hover:bg-primary hover:text-white transition-all p-2 h-9 w-9"
                                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                            disabled={currentPage === pagination.totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
