"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radio, Users, ArrowRight, Search } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-variants";

// Mock data
const mockCreators = [
    { id: 1, name: "FitCoach", username: "fitcoach", category: "HIIT", followers: "54K", avatar: "💪", online: true },
    { id: 2, name: "YogaMaster", username: "yogamaster", category: "Yoga", followers: "32K", avatar: "🧘", online: false },
    { id: 3, name: "HIITQueen", username: "hiitqueen", category: "HIIT", followers: "89K", avatar: "🔥", online: true },
];

const mockStreams = [
    { id: 1, title: "Morning HIIT Blast", creator: "FitCoach", category: "HIIT", viewers: "1.2K" },
    { id: 2, title: "Gentle Yoga Flow", creator: "YogaMaster", category: "Yoga", viewers: "890" },
    { id: 3, title: "Boxing Fundamentals", creator: "BoxingChamp", category: "Boxing", viewers: "650" },
];

interface SearchAllTabProps {
    searchQuery: string;
    onTabChange: (tab: string) => void;
    isLoading?: boolean;
}

export default function SearchAllTab({ searchQuery, onTabChange, isLoading = false }: SearchAllTabProps) {
    const lowerQuery = searchQuery.toLowerCase();

    // Filter data
    const filteredCreators = searchQuery
        ? mockCreators.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.username.toLowerCase().includes(lowerQuery)
        ).slice(0, 3)
        : mockCreators.slice(0, 3);

    const filteredStreams = searchQuery
        ? mockStreams.filter(s =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.creator.toLowerCase().includes(lowerQuery) ||
            s.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3)
        : mockStreams.slice(0, 3);

    const hasResults = filteredCreators.length > 0 || filteredStreams.length > 0;

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-6 w-32 bg-muted animate-pulse mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-[140px]" />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="h-6 w-32 bg-muted animate-pulse mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-[180px]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!hasResults) {
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
            {filteredCreators.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Creators</h3>
                        </div>
                        <button
                            onClick={() => onTabChange("creators")}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredCreators.map((creator) => (
                            <Link
                                key={creator.id}
                                href={`/explore/creator/${creator.username}`}
                                className="group flex items-center gap-4 p-4 bg-card border border-border/30 hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                                        {creator.avatar}
                                    </div>
                                    {creator.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                        {creator.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">@{creator.username} · {creator.followers}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Live Streams Section */}
            {filteredStreams.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-semibold text-foreground">Classes</h3>
                        </div>
                        <button
                            onClick={() => onTabChange("streams")}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredStreams.map((stream) => (
                            <Link
                                key={stream.id}
                                href={`/live/${stream.id}`}
                                className="group bg-card border border-border/30 overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-muted">
                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                                        <Radio className="w-10 h-10 text-primary/50" />
                                    </div>
                                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold">
                                        <div className="w-1.5 h-1.5 bg-white animate-pulse" />
                                        LIVE
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs">
                                        {stream.viewers}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {stream.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{stream.creator}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
