"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { Users } from "lucide-react";
import { useBuckSearch } from "@/hooks/explore";
import Pagination from "@/components/explore/Pagination";

const ITEMS_PER_PAGE = 12;

interface SearchCreatorsTabProps {
    searchQuery: string;
    page: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const formatViewerCount = (count: number) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
};

export default function SearchCreatorsTab({
    searchQuery,
    page,
    onPageChange,
    isLoading: parentLoading = false
}: SearchCreatorsTabProps) {
    const { creators, total, isLoading: searchLoading } = useBuckSearch({
        tab: 'creators',
        query: searchQuery,
        page,
        limit: ITEMS_PER_PAGE
    });

    const isLoading = parentLoading || (searchLoading && creators.length === 0);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} className="h-[180px]" />
                ))}
            </div>
        );
    }

    if (creators.length === 0 && !searchLoading) {
        return (
            <div className="py-16 text-center">
                <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No creators found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    No creators match your search "{searchQuery}". Try adjusting your search terms.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Results count */}
            {total > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                    Showing results for your search ({total} creators found)
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creators.map((creator) => (
                    <Link
                        key={creator.id}
                        href={`/explore/creator/${creator.username}`}
                        className="group bg-card border border-border/30 p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-4 mb-4">
                            <div className="relative">
                                {creator.avatar ? (
                                    <Image
                                        src={creator.avatar}
                                        alt={creator.name}
                                        width={80}
                                        height={80}
                                        className="rounded-full object-cover aspect-square shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                        {creator.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                {creator.isLive && (
                                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-sm border-2 border-card">
                                        LIVE
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{creator.name}</h3>
                                <p className="text-sm text-muted-foreground">@{creator.username}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center text-xs text-muted-foreground font-medium">
                                <span>{formatViewerCount(creator.followers)} followers</span>
                            </div>
                            <Button className="w-full square-edges" size="sm" variant={creator.isLive ? "default" : "outline"}>
                                {creator.isLive ? "Watch Live" : "View Profile"}
                            </Button>
                        </div>
                    </Link>
                ))}
            </div>

            <Pagination
                currentPage={page}
                totalItems={total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={onPageChange}
            />
        </div>
    );
}
