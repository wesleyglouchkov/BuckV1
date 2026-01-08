"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { Users } from "lucide-react";

// Mock creators data (expanded for infinite scroll demo)
const mockCreators = [
    { id: 1, name: "FitCoach", username: "fitcoach", category: "HIIT", followers: "54K", avatar: "💪", online: true },
    { id: 2, name: "YogaMaster", username: "yogamaster", category: "Yoga", followers: "32K", avatar: "🧘", online: false },
    { id: 3, name: "HIITQueen", username: "hiitqueen", category: "HIIT", followers: "89K", avatar: "🔥", online: true },
    { id: 4, name: "PilatesPro", username: "pilatespro", category: "Pilates", followers: "45K", avatar: "🤸", online: false },
    { id: 5, name: "BoxingChamp", username: "boxingchamp", category: "Boxing", followers: "67K", avatar: "🥊", online: true },
    { id: 6, name: "DanceFit", username: "dancefit", category: "Dance", followers: "78K", avatar: "💃", online: false },
    { id: 7, name: "StrengthGuru", username: "strengthguru", category: "Strength Training", followers: "92K", avatar: "🏋️", online: true },
    { id: 8, name: "ZenMaster", username: "zenmaster", category: "Meditation", followers: "41K", avatar: "🧘‍♂️", online: false },
    { id: 9, name: "CardioKing", username: "cardioking", category: "Cardio", followers: "63K", avatar: "🏃", online: true },
    { id: 10, name: "FlexPro", username: "flexpro", category: "Stretching", followers: "28K", avatar: "🤾", online: false },
    { id: 11, name: "PowerLift", username: "powerlift", category: "Strength Training", followers: "85K", avatar: "💪", online: true },
    { id: 12, name: "ZenFlow", username: "zenflow", category: "Yoga", followers: "56K", avatar: "🌸", online: false },
    { id: 13, name: "HIITMaster", username: "hiitmaster", category: "HIIT", followers: "72K", avatar: "⚡", online: true },
    { id: 14, name: "YogaBliss", username: "yogabliss", category: "Yoga", followers: "48K", avatar: "🌺", online: false },
    { id: 15, name: "KickboxKing", username: "kickboxking", category: "Boxing", followers: "59K", avatar: "🥋", online: true },
    { id: 16, name: "SalsaFit", username: "salsafit", category: "Dance", followers: "66K", avatar: "🕺", online: false },
    { id: 17, name: "CoreStrong", username: "corestrong", category: "Pilates", followers: "38K", avatar: "✨", online: true },
    { id: 18, name: "MindfulFit", username: "mindfulfit", category: "Meditation", followers: "35K", avatar: "🌟", online: false },
];

const ITEMS_PER_PAGE = 6;

interface SearchCreatorsTabProps {
    searchQuery: string;
    isLoading?: boolean;
}

export default function SearchCreatorsTab({ searchQuery, isLoading = false }: SearchCreatorsTabProps) {
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const lowerQuery = searchQuery.toLowerCase();

    // Filter creators based on search
    const filteredCreators = searchQuery
        ? mockCreators.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.username.toLowerCase().includes(lowerQuery) ||
            c.category.toLowerCase().includes(lowerQuery)
        )
        : mockCreators;

    const displayedCreators = filteredCreators.slice(0, displayCount);
    const hasMore = displayCount < filteredCreators.length;

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    setIsLoadingMore(true);
                    // Simulate loading delay
                    setTimeout(() => {
                        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
                        setIsLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoadingMore]);

    // Reset on search change
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [searchQuery]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} className="h-[180px]" />
                ))}
            </div>
        );
    }

    if (filteredCreators.length === 0) {
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
            <p className="text-sm text-muted-foreground mb-4">
                Showing {displayedCreators.length} of {filteredCreators.length} creators
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCreators.map((creator) => (
                    <Link
                        key={creator.id}
                        href={`/explore/creator/${creator.username}`}
                        className="group bg-card border border-border/30 p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                                    {creator.avatar}
                                </div>
                                {creator.online && (
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{creator.name}</h3>
                                <p className="text-sm text-muted-foreground">@{creator.username}</p>
                                <p className="text-xs text-muted-foreground mt-1">{creator.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{creator.followers} followers</p>
                            <Button size="sm" variant={creator.online ? "default" : "outline"}>
                                {creator.online ? "Watch Live" : "Follow"}
                            </Button>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Loading more indicator / Infinite scroll trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className="mt-8">
                    {isLoadingMore && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-[180px]" />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* End of results */}
            {!hasMore && filteredCreators.length > ITEMS_PER_PAGE && (
                <p className="text-center text-sm text-muted-foreground mt-8">
                    You've reached the end of the results
                </p>
            )}
        </div>
    );
}
