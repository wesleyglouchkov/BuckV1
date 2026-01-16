"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { creatorService } from "@/services/creator";
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
    Users,
    UserCheck,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Edit2,
    Check,
    X,
    Clock
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateTimeUtils";
import { UserDetailDialog } from "@/components/creator/user-detail-dialog";

const ITEMS_PER_PAGE = 10;

export default function CreatorSubscribersPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("subscribers");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // Price management state
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [newPrice, setNewPrice] = useState("");
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

    // Details Dialog State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsType, setDetailsType] = useState<"subscriber" | "follower">("subscriber");

    // Fetch profile for subscription price
    const { data: profile, isLoading: isProfileLoading } = useSWR(
        ['creator-profile', session?.user?.id],
        () => creatorService.getUserProfile('CREATOR')
    );

    useEffect(() => {
        if (profile?.data?.subscriptionPrice) {
            setNewPrice(profile?.data?.subscriptionPrice.toString());
        }
    }, [profile]);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data based on active tab
    const { data: subscribersData, isLoading: isSubscribersLoading } = useSWR(
        activeTab === "subscribers" ? ['subscribers', page, debouncedSearch] : null,
        () => creatorService.getSubscribers({ page, limit: ITEMS_PER_PAGE, search: debouncedSearch })
    );

    const { data: followersData, isLoading: isFollowersLoading } = useSWR(
        activeTab === "followers" ? ['followers', page, debouncedSearch] : null,
        () => creatorService.getFollowers({ page, limit: ITEMS_PER_PAGE, search: debouncedSearch })
    );

    const handleUpdatePrice = async () => {
        if (!newPrice || isNaN(parseFloat(newPrice))) {
            toast.error("Please enter a valid price");
            return;
        }

        setIsUpdatingPrice(true);
        try {
            await creatorService.updateProfile('CREATOR', {
                subscriptionPrice: parseFloat(newPrice)
            });
            toast.success("Subscription price updated successfully");
            mutate(['creator-profile', session?.user?.id]);
            setIsEditingPrice(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update price");
        } finally {
            setIsUpdatingPrice(false);
        }
    };

    const currentData = activeTab === "subscribers" ? subscribersData : followersData;
    const isLoading = activeTab === "subscribers" ? isSubscribersLoading : isFollowersLoading;
    const list = currentData?.items || [];
    const pagination = currentData?.pagination || { page: 1, totalPages: 1, total: 0 };

    return (
        <div className="p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Community</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your subscribers, followers, and subscription settings.
                    </p>
                </div>

                {/* Price Management Section */}
                <div className="bg-card border border-border/40 p-4 min-w-[300px] relative transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Monthly Subscription</Label>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        {isEditingPrice ? (
                            <>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="pl-7 h-10 rounded-none border-primary/30 focus:ring-primary/20"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className="rounded-none bg-green-600 hover:bg-green-700 h-10 px-3"
                                    onClick={handleUpdatePrice}
                                    disabled={isUpdatingPrice}
                                >
                                    {isUpdatingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-none h-10 px-3"
                                    onClick={() => {
                                        setIsEditingPrice(false);
                                        setNewPrice(profile?.data?.subscriptionPrice?.toString() || "");
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-foreground flex-1">
                                    {isProfileLoading ? (
                                        <div className="h-9 w-24 bg-muted animate-pulse" />
                                    ) : (
                                        <span>${profile?.data?.subscriptionPrice || "0.00"}</span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none border-border/40 hover:bg-primary hover:text-white transition-all gap-2"
                                    onClick={() => setIsEditingPrice(true)}
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Change
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="subscribers" className="w-full" onValueChange={(v) => {
                setActiveTab(v);
                setPage(1);
            }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-muted/50 p-1 h-12 rounded-none border border-border/20">
                        <TabsTrigger
                            value="subscribers"
                            className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                        >
                            <UserCheck className="w-4 h-4" />
                            Subscribers
                            <span className="ml-1 text-[10px] bg-primary/10 px-1.5 py-0.5 border border-primary/20 uppercase font-bold">
                                {profile?.data?._count?.subscribers || 0}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="followers"
                            className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                        >
                            <Users className="w-4 h-4" />
                            Followers
                            <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 border border-border uppercase font-bold text-muted-foreground">
                                {profile?.data?._count?.followers || 0}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 rounded-none bg-card border-border/20 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <TabsContent value="subscribers" className="mt-0 outline-none">
                    <div className="bg-card border border-border/20 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/10 hover:bg-transparent h-16">
                                    <TableHead className="w-[300px]">Subscriber</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined Since</TableHead>
                                    <TableHead>Cycle</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i} className="border-border/10">
                                            <TableCell><div className="h-10 bg-muted animate-pulse w-full" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-12" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-24" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <UserCheck className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-lg font-medium">No subscribers found</p>
                                                <p className="text-sm">Try adjusting your search filters.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    list.map((sub: any) => (
                                        <TableRow key={sub.id} className="border-border/10 hover:bg-muted/10 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar src={sub?.member?.avatar} name={sub?.member?.name} className="w-10 h-10" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground leading-none">{sub?.member?.name}</span>
                                                        <span className="text-[11px] text-muted-foreground mt-1">@{sub?.member?.username}</span>
                                                        <span className="text-[10px] text-primary/70 font-medium uppercase tracking-tighter mt-0.5">{sub?.member?.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`rounded-none uppercase text-[9px] font-black tracking-widest px-2 py-0.5 ${sub.status === 'active'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : sub.status === 'cancelled'
                                                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[13px] text-muted-foreground align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                    <span>{formatDate(sub.startDate)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-[13px] text-muted-foreground align-middle">
                                                {sub.endDate ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-primary opacity-60 uppercase tracking-tighter mb-0.5">
                                                            {sub.status === 'active' ? 'Renews' : 'Expired'}
                                                        </span>
                                                        <span className={sub.status !== 'active' ? 'line-through opacity-50' : ''}>
                                                            {formatDate(sub.endDate)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-black text-primary/40 italic tracking-widest bg-primary/5 px-2 py-0.5">RECURRING</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none border-border/40 hover:bg-primary hover:text-white transition-all px-4 h-9"
                                                    onClick={() => {
                                                        setSelectedUser(sub);
                                                        setDetailsType("subscriber");
                                                        setIsDetailsOpen(true);
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Area */}
                        {!isLoading && pagination.totalPages > 1 && (
                            <div className="p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
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
                    </div>
                </TabsContent>

                <TabsContent value="followers" className="mt-0 outline-none">
                    <div className="bg-card border border-border/20 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/10 hover:bg-transparent">
                                    <TableHead className="w-[400px]">Follower</TableHead>
                                    <TableHead>Followed Since</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i} className="border-border/10">
                                            <TableCell><div className="h-10 bg-muted animate-pulse w-full" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-32" /></TableCell>
                                            <TableCell><div className="h-5 bg-muted animate-pulse w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-lg font-medium">No followers found</p>
                                                <p className="text-sm">Grow your community to see followers here.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    list.map((follow: any) => (
                                        <TableRow key={follow.id} className="border-border/10 hover:bg-muted/10 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar src={follow?.follower?.avatar} name={follow?.follower?.name} className="w-10 h-10" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground leading-none">{follow?.follower?.name}</span>
                                                        <span className="text-[11px] text-muted-foreground mt-1">@{follow?.follower?.username}</span>
                                                        <span className="text-[10px] text-primary/70 font-medium uppercase tracking-tighter mt-0.5">{follow?.follower?.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[13px] text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                    <span>{formatDate(follow.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none border-border/40 hover:bg-primary hover:text-white transition-all px-4 h-9"
                                                    onClick={() => {
                                                        setSelectedUser(follow);
                                                        setDetailsType("follower");
                                                        setIsDetailsOpen(true);
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Area */}
                        {!isLoading && pagination.totalPages > 1 && (
                            <div className="p-4 border-t border-border/10 bg-muted/10 flex items-center justify-between">
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
                    </div>
                </TabsContent>
            </Tabs>

            <UserDetailDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                user={selectedUser}
                type={detailsType}
            />
        </div>
    );
}
