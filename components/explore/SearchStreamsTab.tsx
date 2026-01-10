"use client";

import { useCallback } from "react";
import { Radio } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { VideoCard } from "@/components/VideoCard";
import { CATEGORIES, WorkoutCategory } from "@/lib/constants/categories";
import { useBuckSearch } from "@/hooks/explore";
import Pagination from "@/components/explore/Pagination";

const ITEMS_PER_PAGE = 12;

interface SearchStreamsTabProps {
    searchQuery: string;
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    page: number;
    onPageChange: (page: number) => void;
    isLive: boolean | null;
    onIsLiveChange: (isLive: boolean | null) => void;
    isLoading?: boolean;
}

export default function SearchStreamsTab({
    searchQuery,
    selectedCategory,
    onCategoryChange,
    page,
    onPageChange,
    isLive,
    onIsLiveChange,
    isLoading: parentLoading = false
}: SearchStreamsTabProps) {
    const { streams, total, isLoading: searchLoading } = useBuckSearch({
        tab: 'class',
        query: searchQuery,
        page,
        limit: ITEMS_PER_PAGE,
        workoutType: selectedCategory || undefined,
        isLive: isLive === true ? true : undefined
    });

    const isLoading = parentLoading || (searchLoading && streams.length === 0);

    const handleCategoryChange = useCallback((category: string | null) => {
        onCategoryChange(category);
    }, [onCategoryChange]);

    if (isLoading) {
        return (
            <div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {Array.from({ length: 8 }).map((_, i) => (
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
            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleCategoryChange(null)}
                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-0 ${!selectedCategory
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
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-0 ${isActive
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

                {/* Additional Filters */}
                <div className="flex justify-end items-center gap-4 shrink-0 w-full">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                            onClick={() => onIsLiveChange(isLive === true ? null : true)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${isLive === true ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white transition-all ${isLive === true ? 'left-6' : 'left-1'}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Live Now Only</span>
                    </label>
                </div>
            </div>

            {/* Results count */}
            {total > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                    Showing results for your search ({total} classes found)
                </p>
            )}

            {/* Streams Grid */}
            {streams.length === 0 && !searchLoading ? (
                <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <Radio className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No classes found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery
                            ? `No classes match "${searchQuery}"${selectedCategory ? ` in ${selectedCategory}` : ""}. Try adjusting your filters.`
                            : selectedCategory
                                ? `No classes in ${selectedCategory} right now.`
                                : "No classes available right now."
                        }
                    </p>
                    {(selectedCategory || isLive) && (
                        <div className="flex justify-center gap-4 mt-4">
                            {selectedCategory && (
                                <button
                                    onClick={() => handleCategoryChange(null)}
                                    className="text-sm text-primary hover:underline cursor-pointer border-0 bg-transparent"
                                >
                                    Clear category
                                </button>
                            )}
                            {isLive && (
                                <button
                                    onClick={() => onIsLiveChange(null)}
                                    className="text-sm text-primary hover:underline cursor-pointer border-0 bg-transparent"
                                >
                                    Clear live filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {streams.map((stream) => (
                            <VideoCard key={stream.id} stream={stream} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalItems={total}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={onPageChange}
                    />
                </>
            )}
        </div>
    );
}
