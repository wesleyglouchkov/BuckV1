
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
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Heart,
    Star,
    Eye,
    UserX,
    UserCheck,
    ExternalLink,
    LayoutDashboard,
    User,
    Users
} from "lucide-react";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { UnsubscribeDialog } from "@/components/live/subscribe/UnsubscribeDialog";

// Mock Data Generators
const generateMockFollowing = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `f-${i}`,
        creator: {
            id: `c-${i}`,
            name: `Creator ${i + 1}`,
            username: `creator${i + 1}`,
            avatar: i % 3 === 0 ? "/avatars/01.png" : undefined
        },
        followedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        status: "active"
    }));
};

const generateMockSubscribed = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `s-${i}`,
        creator: {
            id: `c-${i + 100}`,
            name: `Premium Creator ${i + 1}`,
            username: `premium_creator${i + 1}`,
            avatar: undefined
        },
        subscribedAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
        renewalDate: new Date(Date.now() + Math.floor(Math.random() * 2000000000)).toISOString(),
        status: "active",
        amount: 499
    }));
};

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
    const [activeTab, setActiveTab] = useState("following");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Mock Data State
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [subscribedList, setSubscribedList] = useState<any[]>([]);

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

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Simulate Data Fetching
    useEffect(() => {
        setIsLoading(true);
        // Simulate API call delay
        const timer = setTimeout(() => {
            setFollowingList(generateMockFollowing(45));
            setSubscribedList(generateMockSubscribed(12));
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Filter and Paginate
    const currentList = activeTab === "following" ? followingList : subscribedList;

    const filteredList = currentList.filter(item =>
        item.creator.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.creator.username.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const paginatedList = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleUnfollow = (id: string) => {
        // Implement unfollow logic here
        console.log("Unfollowing:", id);
        setFollowingList(prev => prev.filter(item => item.id !== id));
    };

    const handleUnsubscribe = (id: string) => {
        // Implement unsubscribe logic here
        console.log("Unsubscribing:", id);
        setSubscribedList(prev => prev.filter(item => item.id !== id));
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
                <div className="md:hidden h-10" />

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">My Creators</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage the creators you follow and your active subscriptions.
                        </p>
                    </div>

                    <Tabs defaultValue="following" className="w-full" onValueChange={(v) => {
                        setActiveTab(v);
                        setPage(1);
                    }}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <TabsList className="bg-muted/50 p-1 h-12 rounded-none border border-border/20">
                                <TabsTrigger
                                    value="following"
                                    className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                                >
                                    <Heart className="w-4 h-4" />
                                    Following
                                </TabsTrigger>
                                <TabsTrigger
                                    value="subscribed"
                                    className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                                >
                                    <Star className="w-4 h-4" />
                                    Subscribed
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
                                        <TableHead>Status</TableHead>
                                        <TableHead>{activeTab === "following" ? "Followed Since" : "Renewal Date"}</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <TableRow key={i} className="border-border/10">
                                                <TableCell><div className="h-10 bg-muted animate-pulse w-full" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-24" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                                <TableCell><div className="h-5 bg-muted animate-pulse w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : paginatedList.length === 0 ? (
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
                                        paginatedList.map((item: any) => (
                                            <TableRow key={item.id} className="border-border/10 hover:bg-muted/10 transition-colors">
                                                {/* Creator Cell */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar src={item.creator.avatar} name={item.creator.name} className="w-10 h-10" />
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">{item.creator.name}</span>
                                                            <span className="text-xs text-muted-foreground italic">@{item.creator.username}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Status Cell */}
                                                <TableCell>
                                                    <Badge className={`rounded-none uppercase text-[10px] font-bold tracking-widest ${(item.status === 'active')
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>

                                                {/* Date Cell */}
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDateTime(activeTab === "following" ? item.followedAt : item.renewalDate)}
                                                </TableCell>

                                                {/* Content View Cell */}
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-none text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all text-xs gap-2"
                                                        onClick={() => console.log("View content for", item.creator.name)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View Content
                                                    </Button>
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
                            {!isLoading && totalPages > 1 && (
                                <div className="p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
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
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

