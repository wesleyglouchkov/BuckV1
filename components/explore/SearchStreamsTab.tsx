"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { CATEGORIES, WorkoutCategory } from "@/lib/constants/categories";

// Mock streams data (expanded for infinite scroll demo)
const mockStreams = [
    { id: 1, title: "Morning HIIT Blast", creator: "FitCoach", category: "HIIT", viewers: "1.2K", thumbnail: null },
    { id: 2, title: "Gentle Yoga Flow", creator: "YogaMaster", category: "Yoga", viewers: "890", thumbnail: null },
    { id: 3, title: "Boxing Fundamentals", creator: "BoxingChamp", category: "Boxing", viewers: "650", thumbnail: null },
    { id: 4, title: "Cardio Dance Party", creator: "DanceFit", category: "Dance", viewers: "1.5K", thumbnail: null },
    { id: 5, title: "Pilates Core Workout", creator: "PilatesPro", category: "Pilates", viewers: "420", thumbnail: null },
    { id: 6, title: "Advanced Strength Training", creator: "StrengthGuru", category: "Strength Training", viewers: "780", thumbnail: null },
    { id: 7, title: "Meditation & Breathing", creator: "ZenMaster", category: "Meditation", viewers: "340", thumbnail: null },
    { id: 8, title: "Stretching for Flexibility", creator: "FlexPro", category: "Stretching", viewers: "290", thumbnail: null },
    { id: 9, title: "HIIT Cardio Burn", creator: "FitCoach", category: "HIIT", viewers: "980", thumbnail: null },
    { id: 10, title: "Power Yoga", creator: "YogaMaster", category: "Yoga", viewers: "750", thumbnail: null },
    { id: 11, title: "Boxing Cardio", creator: "BoxingChamp", category: "Boxing", viewers: "560", thumbnail: null },
    { id: 12, title: "Latin Dance Fitness", creator: "DanceFit", category: "Dance", viewers: "1.1K", thumbnail: null },
    { id: 13, title: "Full Body HIIT", creator: "HIITQueen", category: "HIIT", viewers: "1.8K", thumbnail: null },
    { id: 14, title: "Restorative Yoga", creator: "YogaMaster", category: "Yoga", viewers: "620", thumbnail: null },
    { id: 15, title: "Kickboxing Basics", creator: "BoxingChamp", category: "Boxing", viewers: "720", thumbnail: null },
    { id: 16, title: "Hip Hop Dance", creator: "DanceFit", category: "Dance", viewers: "890", thumbnail: null },
    { id: 17, title: "Core Pilates", creator: "PilatesPro", category: "Pilates", viewers: "380", thumbnail: null },
    { id: 18, title: "Upper Body Strength", creator: "StrengthGuru", category: "Strength Training", viewers: "640", thumbnail: null },
];

const ITEMS_PER_PAGE = 6;

interface SearchStreamsTabProps {
    searchQuery: string;
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    isLoading?: boolean;
}

export default function SearchStreamsTab({
    searchQuery,
    selectedCategory,
    onCategoryChange,
    isLoading = false
}: SearchStreamsTabProps) {
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const lowerQuery = searchQuery.toLowerCase();

    // Filter streams based on search and category
    let filteredStreams = mockStreams;

    if (searchQuery) {
        filteredStreams = filteredStreams.filter(s =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.creator.toLowerCase().includes(lowerQuery) ||
            s.category.toLowerCase().includes(lowerQuery)
        );
    }

    if (selectedCategory) {
        filteredStreams = filteredStreams.filter(s =>
            s.category.toLowerCase() === selectedCategory.toLowerCase()
        );
    }

    const displayedStreams = filteredStreams.slice(0, displayCount);
    const hasMore = displayCount < filteredStreams.length;

    // Reset display count when filters change
    const handleCategoryChange = useCallback((category: string | null) => {
        setDisplayCount(ITEMS_PER_PAGE);
        onCategoryChange(category);
    }, [onCategoryChange]);

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

    // Reset on search/category change
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [searchQuery, selectedCategory]);

    if (isLoading) {
        return (
            <div>
                {/* Category Filters Skeleton */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 w-24 bg-muted animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} className="h-[200px]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${!selectedCategory
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                >
                    All Categories
                </button>
                {CATEGORIES.map((category: WorkoutCategory) => {
                    const IconComponent = category.icon;
                    const isActive = selectedCategory?.toLowerCase() === category.name.toLowerCase();
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.name)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <IconComponent size={16} />
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Results count */}
            {filteredStreams.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                    Showing {displayedStreams.length} of {filteredStreams.length} streams
                </p>
            )}

            {/* Streams Grid */}
            {filteredStreams.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <Radio className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No streams found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery
                            ? `No streams match "${searchQuery}"${selectedCategory ? ` in ${selectedCategory}` : ""}. Try adjusting your filters.`
                            : selectedCategory
                                ? `No streams in ${selectedCategory} right now.`
                                : "No streams available right now."
                        }
                    </p>
                    {selectedCategory && (
                        <button
                            onClick={() => handleCategoryChange(null)}
                            className="mt-4 text-sm text-primary hover:underline cursor-pointer"
                        >
                            Clear category filter
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedStreams.map((stream) => (
                            <Link
                                key={stream.id}
                                href={`/live/${stream.id}`}
                                className="group bg-card border border-border/30 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Thumbnail placeholder */}
                                <div className="relative aspect-video bg-muted">
                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                                        <Radio className="w-12 h-12 text-primary/50" />
                                    </div>
                                    {/* Live badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-500 text-white text-xs font-bold">
                                        <span className="w-2 h-2 bg-white animate-pulse" />
                                        LIVE
                                    </div>
                                    {/* Viewers */}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-medium">
                                        {stream.viewers} watching
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                        {stream.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{stream.creator}</p>
                                    <div className="mt-2">
                                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium">
                                            {stream.category}
                                        </span>
                                    </div>
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
                                        <SkeletonCard key={i} className="h-[200px]" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* End of results */}
                    {!hasMore && filteredStreams.length > ITEMS_PER_PAGE && (
                        <p className="text-center text-sm text-muted-foreground mt-8">
                            You've reached the end of the results
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
