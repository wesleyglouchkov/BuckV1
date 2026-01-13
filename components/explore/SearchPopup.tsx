"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Radio, Search as SearchIcon, Loader2 } from "lucide-react";
import { useQuickSearch } from "@/hooks/explore";
import { SkeletonSidebarItem } from "@/components/ui/skeleton-variants";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { VideoSnapshot } from "@/lib/s3/video-thumbnail";
import { CATEGORIES } from "@/lib/constants/categories";

interface SearchPopupProps {
    query: string;
    debouncedQuery: string;
    isVisible: boolean;
    onClose: () => void;
}

const formatViewerCount = (count: number) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
};

export default function SearchPopup({ query, debouncedQuery, isVisible, onClose }: SearchPopupProps) {
    const { creators, streams, isLoading } = useQuickSearch(debouncedQuery);

    if (!isVisible || !query.trim() || query.length < 1) return null;

    // Show skeletons if loading OR if query has changed but debouncedQuery hasn't caught up yet
    const showSkeletons = isLoading || (query !== debouncedQuery && query.length >= 1);
    const hasResults = creators.length > 0 || streams.length > 0;

    return (
        <div
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
        >
            {showSkeletons ? (
                <div className="p-3 space-y-4 max-h-[280px] md:max-h-[450px] overflow-y-auto">
                    <div className="space-y-2">
                        <div className="px-2 pb-1">
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonSidebarItem key={`skeleton-creator-${i}`} />
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="px-2 pb-1">
                            <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <SkeletonSidebarItem key={`skeleton-stream-${i}`} />
                        ))}
                    </div>
                </div>
            ) : !hasResults ? (
                <div className="p-8 text-center">
                    <SearchIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium truncate px-4">
                        No results found for "{query}"
                    </p>
                </div>
            ) : (
                <div className="max-h-[280px] md:max-h-[450px] overflow-y-auto">
                    {/* Creators Section */}
                    {creators.length > 0 && (
                        <div className="p-3 border-b border-border/30">
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creators</span>
                            </div>
                            <ul className="space-y-0.5">
                                {creators.map((creator) => (
                                    <li key={creator.id}>
                                        <Link
                                            href={`/explore/creator/${creator.username}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-2 py-2 hover:bg-accent transition-colors group"
                                        >
                                            <div className="relative">
                                                <UserAvatar
                                                    src={creator.avatar}
                                                    name={creator.name}
                                                    size="md"
                                                    className="w-9 h-9"
                                                />
                                                {creator.isLive && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-card rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {creator.name}
                                                    </p>
                                                    {creator.isLive && (
                                                        <span className="text-[9px] font-bold bg-red-500 text-white px-1 rounded uppercase">Live</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    @{creator.username} · {formatViewerCount(creator.followers)} followers
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Streams Section */}
                    {streams.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Radio className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Classes</span>
                            </div>
                            <ul className="space-y-0.5">
                                {streams.map((stream) => (
                                    <SearchStreamItem key={stream.id} stream={stream} onClose={onClose} />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* View All Results */}
            <Link
                href={`/explore?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-t border-border/30"
            >
                <SearchIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-tight">
                    View all results for "{query}"
                </span>
            </Link>
        </div>
    );
}

function SearchStreamItem({ stream, onClose }: { stream: any, onClose: () => void }) {
    const initialIsSnapshot = !stream.thumbnail && !stream.isLive;
    const [thumbnailState, setThumbnailState] = useState<{
        displayUrl: string | null;
        useVideoSnapshot: boolean;
        isLoading: boolean;
    }>({
        displayUrl: null,
        useVideoSnapshot: initialIsSnapshot,
        isLoading: true // Start loading to check for signed URLs
    });

    useEffect(() => {
        let isMounted = true;

        const resolveThumbnail = async () => {
            // Priority 1: STRICT Live Stream Logic
            // User requested: "the live one should not show image just the icon red of live"
            // So if it is live, we explicitly set no URL to trigger the Red Radio Icon.
            if (stream.isLive) {
                if (isMounted) {
                    setThumbnailState({
                        displayUrl: null,
                        useVideoSnapshot: false,
                        isLoading: false
                    });
                }
                return;
            }

            // Priority 2: Recorded Stream Logic (!isLive)

            // 2a. Explicit Thumbnail (Highest priority for recorded)
            if (stream.thumbnail) {
                try {
                    const url = await getSignedStreamUrl(stream.thumbnail);
                    if (isMounted && url) {
                        setThumbnailState({
                            displayUrl: url,
                            useVideoSnapshot: false,
                            isLoading: false
                        });
                        return; // Done
                    }
                } catch (e) {
                    // Fail silently
                }
            }

            // 2b. Video Snapshot (If replay/stream URL exists)
            const videoUrl = stream.replayUrl || stream.streamUrl;
            if (videoUrl) {
                try {
                    const url = await getSignedStreamUrl(videoUrl);
                    if (isMounted && url) {
                        setThumbnailState({
                            displayUrl: url,
                            useVideoSnapshot: true,
                            isLoading: false
                        });
                        return; // Done
                    }
                } catch (e) {
                    // Fail silently
                }
            }

            // 2c. Category Fallback (If no video/snapshot available)
            // "if not live and no replay url then fallback image based on workoutType"
            const categoryName = stream.workoutType?.toLowerCase() || 'other';
            const category = CATEGORIES.find(c => c.name.toLowerCase() === categoryName);
            if (isMounted && category?.fallbackImage) {
                setThumbnailState({
                    displayUrl: category.fallbackImage,
                    useVideoSnapshot: false,
                    isLoading: false
                });
                return;
            }

            // 2d. Ultimate Fallback
            if (isMounted) {
                setThumbnailState({
                    displayUrl: "https://placehold.co/1200x675/1a1a1a/ffffff?text=Buck+Stream",
                    useVideoSnapshot: false,
                    isLoading: false
                });
            }
        };

        resolveThumbnail();
        return () => { isMounted = false; };
    }, [stream]);

    return (
        <li>
            <Link
                href={`/live/${stream.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-2 py-2 hover:bg-accent transition-colors group"
            >
                <div className="relative w-10 h-10 bg-muted shrink-0 overflow-hidden">
                    {thumbnailState.isLoading ? (
                        <div className="w-full h-full bg-muted animate-pulse" />
                    ) : !thumbnailState.displayUrl ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-500/5">
                            <Radio className="w-5 h-5 text-red-500/40" />
                        </div>
                    ) : thumbnailState.useVideoSnapshot ? (
                        <VideoSnapshot
                            src={thumbnailState.displayUrl}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <Image
                            src={thumbnailState.displayUrl}
                            alt={stream.title}
                            fill
                            className="object-cover"
                        />
                    )}
                    {stream.isLive && (
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {stream.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate italic">
                        {stream.creator.name} · {stream.workoutType || "Class"} {stream.isLive ? `· ${formatViewerCount(stream.viewerCount)} live` : ""}
                    </p>
                </div>
            </Link>
        </li>
    );
}
