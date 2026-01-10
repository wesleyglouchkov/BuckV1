"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Radio, Users, ArrowRight, Search } from "lucide-react";
import { SkeletonCard, SkeletonBox } from "@/components/ui/skeleton-variants";
import { VideoCard } from "@/components/VideoCard";
import { useBuckSearch } from "@/hooks/explore";

interface SearchAllTabProps {
    searchQuery: string;
    onTabChange: (tab: string) => void;
    isLoading?: boolean;
}

export default function SearchAllTab({ searchQuery, onTabChange, isLoading: parentLoading = false }: SearchAllTabProps) {
    const { creators, streams, isLoading: searchLoading } = useBuckSearch({
        tab: 'all',
        query: searchQuery,
        limit: 4,
        isLive: searchQuery === "" ? true : undefined
    });

    const isLoading = parentLoading || searchLoading;
    const hasResults = creators.length > 0 || streams.length > 0;

    if (isLoading) {
        return (
            <div className="space-y-12">
                <div>
                    <div className="h-6 w-48 bg-muted animate-pulse mb-6 opacity-60" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border/20">
                                <SkeletonBox className="h-11 w-11 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <SkeletonBox className="h-4 w-3/4" />
                                    <SkeletonBox className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-8">
                    <div className="h-6 w-48 bg-muted animate-pulse mb-6 opacity-60" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!hasResults && searchQuery) {
        return (
            <div className="py-16 text-center">
                <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find anything matching "{searchQuery}". Try different keywords.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Creators Section */}
            {creators.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Creators</h3>
                        </div>
                        <button
                            onClick={() => onTabChange("creators")}
                            className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {creators.map((creator) => (
                            <Link
                                key={creator.id}
                                href={`/explore/creator/${creator.username}`}
                                className="group flex items-center gap-3 p-4 bg-card border border-border/30 hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="relative shrink-0">
                                    {creator.avatar ? (
                                        <Image
                                            src={creator.avatar}
                                            alt={creator.name}
                                            width={44}
                                            height={44}
                                            className="rounded-full object-cover aspect-square"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {creator.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    {creator.isLive && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-card rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                        {creator.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                                        @{creator.username} · {creator.followers >= 1000 ? (creator.followers / 1000).toFixed(1) + "K" : creator.followers.toString()} followers
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Live Streams Section */}
            {streams.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-semibold text-foreground">Classes</h3>
                        </div>
                        <button
                            onClick={() => onTabChange("streams")}
                            className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {streams.map((stream) => (
                            <VideoCard key={stream.id} stream={stream} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
