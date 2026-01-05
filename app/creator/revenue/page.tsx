"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
    DollarSign,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Clock,
    Heart,
    CreditCard
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/dateTimeUtils";

const ITEMS_PER_PAGE = 10;

export default function CreatorRevenuePage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("tips");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch revenue stats
    const { data: statsResponse, isLoading: isStatsLoading } = useSWR(
        ['revenue-stats', session?.user?.id],
        () => creatorService.getRevenueStats()
    );

    // Fetch data based on active tab
    const { data: tipsResponse, isLoading: isTipsLoading } = useSWR(
        activeTab === "tips" ? ['revenue-tips', page, debouncedSearch] : null,
        () => creatorService.getTipTransactions({ page, limit: ITEMS_PER_PAGE, search: debouncedSearch })
    );

    const { data: subscriptionResponse, isLoading: isSubscriptionLoading } = useSWR(
        activeTab === "subscriptions" ? ['revenue-subscriptions', page, debouncedSearch] : null,
        () => creatorService.getSubscriptionTransactions({ page, limit: ITEMS_PER_PAGE, search: debouncedSearch })
    );

    const stats = statsResponse?.data || { totalRevenue: 0, totalTips: 0, totalTipsCount: 0 };
    const currentResponse = activeTab === "tips" ? tipsResponse : subscriptionResponse;
    const isLoadingData = activeTab === "tips" ? isTipsLoading : isSubscriptionLoading;
    const list = currentResponse?.data?.items || [];
    const pagination = currentResponse?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">Revenue</h1>
                <p className="text-muted-foreground mt-2">
                    Transparent tracking of your earnings and transaction history.
                </p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border/40 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                            {isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : `$${stats.totalRevenue?.toLocaleString() || "0.00"}`}
                        </span>
                        <span className="text-xs text-green-500 font-medium">+12.5%</span>
                    </div>
                </div>

                <div className="bg-card border border-border/40 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Tips Collected</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                            {isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : `$${stats.totalTips?.toLocaleString() || "0.00"}`}
                        </span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-current" /> {stats.totalTipsCount || 0} Tips
                        </span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="tips" className="w-full" onValueChange={(v) => {
                setActiveTab(v);
                setPage(1);
            }}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <TabsList className="bg-muted/50 p-1 h-12 rounded-none border border-border/20">
                        <TabsTrigger
                            value="tips"
                            className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                        >
                            <DollarSign className="w-4 h-4" />
                            Tips (Bucks)
                        </TabsTrigger>
                        <TabsTrigger
                            value="subscriptions"
                            className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-full flex gap-2 cursor-pointer"
                        >
                            <CreditCard className="w-4 h-4" />
                            Subscriptions Ledger
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

                {/* Shared Table Container */}
                <div className="bg-card border border-border/20 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/10 hover:bg-transparent">
                                <TableHead className="w-[300px]">Member</TableHead>
                                <TableHead>{activeTab === "tips" ? "Total Amount" : "Monthly Fee"}</TableHead>
                                <TableHead>Platform Fee</TableHead>
                                <TableHead>You Received</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingData ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="border-border/10">
                                        <TableCell><div className="h-10 bg-muted animate-pulse w-full" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-12" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-16" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-20" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-24" /></TableCell>
                                        <TableCell><div className="h-5 bg-muted animate-pulse w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            {activeTab === "tips" ? <Heart className="w-12 h-12 mb-4 opacity-20" /> : <CreditCard className="w-12 h-12 mb-4 opacity-20" />}
                                            <p className="text-lg font-medium">No transactions found</p>
                                            <p className="text-sm">History will appear here once activities occur.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((item: any) => (
                                    <TableRow key={item.id} className="border-border/10 hover:bg-muted/10 transition-colors">
                                        {/* Member Cell */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <UserAvatar src={item.member?.avatar} name={item.member?.name || "User"} className="w-10 h-10" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{item.member?.name}</span>
                                                    <span className="text-xs text-muted-foreground italic">@{item.member?.username}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Amount Cell */}
                                        <TableCell className="font-medium text-foreground">
                                            ${activeTab === "tips"
                                                ? (item.amount_cents / 100).toFixed(2)
                                                : parseFloat(item.fee).toFixed(2)}
                                        </TableCell>

                                        {/* Platform Fee Cell */}
                                        <TableCell className="text-muted-foreground text-sm">
                                            ${activeTab === "tips"
                                                ? (item.platform_fee_cents / 100).toFixed(2)
                                                : (item.platformFee || 0).toFixed(2)}
                                        </TableCell>

                                        {/* Net Amount Cell */}
                                        <TableCell className="font-bold text-green-600">
                                            ${activeTab === "tips"
                                                ? (item.creator_receives_cents / 100).toFixed(2)
                                                : (item.creatorReceives || 0).toFixed(2)}
                                        </TableCell>

                                        {/* Status Cell */}
                                        <TableCell>
                                            <Badge className={`rounded-none uppercase text-[10px] font-bold tracking-widest ${(item.status === 'completed' || item.status === 'active')
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : item.status === 'pending'
                                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>

                                        {/* Date Cell */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 opacity-50" />
                                                {formatDateTime(item.created_at || item.startDate)}
                                            </div>
                                        </TableCell>

                                        {/* Action Cell */}
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-none border-border/40 hover:bg-primary hover:text-white transition-all px-4"
                                            >
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Area */}
                    {!isLoadingData && pagination.totalPages > 1 && (
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
            </Tabs>
        </div>
    );
}
