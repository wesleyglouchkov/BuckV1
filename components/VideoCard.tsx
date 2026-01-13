import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { VideoSnapshot } from "@/lib/s3/video-thumbnail";
import { CATEGORIES } from "@/lib/constants/categories";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoCardProps {
    stream: {
        id: string;
        title: string;
        thumbnail?: string | null;
        replayUrl?: string | null;
        streamUrl?: string | null;
        workoutType?: string | null;
        createdAt: Date | string;
        duration?: number; // In seconds
        // Using viewers or views depending on your data model
        viewerCount?: number;
        views?: number;
        creator: {
            id: string;
            name: string;
            avatar?: string | null;
            username?: string;
        };
        isLive?: boolean;
    };
    signedThumbnailUrl?: string | null;
    className?: string;
}

export function VideoCard({ stream, signedThumbnailUrl, className }: VideoCardProps) {
    // Determine initial snapshot mode: if thumbnail is missing, we'll likely need a snapshot
    const initialIsSnapshot = !stream.thumbnail && !stream.isLive;

    const [thumbnailState, setThumbnailState] = useState<{
        displayUrl: string | null;
        useVideoSnapshot: boolean;
        isLoading: boolean;
    }>({
        displayUrl: signedThumbnailUrl || null,
        useVideoSnapshot: initialIsSnapshot,
        isLoading: !signedThumbnailUrl // If we have the URL already, we are "ready"
    });

    useEffect(() => {
        let isMounted = true;

        const resolveThumbnail = async () => {
            // Priority 1: Use explicit props if provided (already handled in initial state, but update if props change)
            if (signedThumbnailUrl) {
                if (isMounted) {
                    setThumbnailState({
                        displayUrl: signedThumbnailUrl,
                        useVideoSnapshot: !stream.thumbnail && !stream.isLive,
                        isLoading: false
                    });
                }
                return;
            }

            // Priority 2: Use explicit thumbnail from S3 (if available)
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
                    // Fail silently to fall back
                }
            }

            // Priority 3: Use video replay/stream URL for snapshot (frame from video)
            // We only do this for recorded streams (isLive is false)
            const videoUrl = !stream.isLive ? (stream.replayUrl || stream.streamUrl) : null;
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
                    // Fail silently to fall back
                }
            }

            // Priority 4: Fallback to category image (workoutType always exists)
            const categoryName = stream.workoutType?.toLowerCase() || 'other';
            const category = CATEGORIES.find(c => c.name.toLowerCase() === categoryName);
            if (isMounted && category?.fallbackImage) {
                setThumbnailState({
                    displayUrl: category.fallbackImage,
                    useVideoSnapshot: false,
                    isLoading: false
                });
                return; // Done
            }

            // Priority 5: Ultimate fallback (should rarely happen)
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
    }, [stream, signedThumbnailUrl]);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00";
        // Subtract 7 seconds to account for stream processing
        const adjustedSeconds = Math.max(0, Math.floor(seconds) - 7);
        const h = Math.floor(adjustedSeconds / 3600);
        const m = Math.floor((adjustedSeconds % 3600) / 60);
        const s = adjustedSeconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const formatViewers = (count?: number) => {
        if (!count) return "0";
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + "k";
        }
        return count.toString();
    };

    const viewers = stream.viewerCount || stream.views || 0;

    // Determine what to render
    const renderThumbnail = () => {
        if (thumbnailState.isLoading || !thumbnailState.displayUrl) {
            return <Skeleton className="w-full h-full" />;
        }

        // If we are using video snapshot and have a URL, render the video frame
        if (thumbnailState.useVideoSnapshot) {
            return (
                <VideoSnapshot
                    src={thumbnailState.displayUrl}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
            );
        }

        // Otherwise render the image (thumbnail, category fallback, or placeholder)
        return (
            <Image
                unoptimized
                src={thumbnailState.displayUrl}
                alt={stream.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
        );
    };

    return (
        <Link href={`/live/${stream.id}`} className={cn("block group relative", className)}>
            <div
                className="relative bg-card border border-border transition-all duration-300 ease-out
                group-hover:border-l-8 group-hover:border-b-8 group-hover:border-l-primary group-hover:border-b-primary
                mobile-touch-interaction
                "
            >
                {/* Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* Thumbnail or VideoSnapshot */}
                    {renderThumbnail()}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60" />


                    {/* Live Badge - Top Right */}
                    <div className="absolute top-2 right-2 z-10">
                        {stream.isLive && (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                                Live
                            </span>
                        )}
                    </div>

                    {/* Duration - Bottom Right (hidden when live) */}
                    {!stream.isLive && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 text-white text-xs font-medium rounded-sm z-10">
                            {formatDuration(stream.duration)}
                        </div>
                    )}

                    {/* Views/Viewers - Top Left */}
                    {viewers > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="px-1.5 py-0.5 bg-black/60 text-white text-xs font-semibold rounded-sm">
                                {formatViewers(viewers)} {stream.isLive
                                    ? (viewers === 1 ? 'viewer' : 'viewers')
                                    : (viewers === 1 ? 'view' : 'views')}
                            </span>
                        </div>
                    )}

                    {/* Time Ago - Bottom Left (hidden when live) */}
                    {!stream.isLive && (
                        <div className="absolute bottom-2 left-2 z-10">
                            <span className="px-1.5 py-0.5 bg-black/60 text-white text-xs font-semibold rounded-sm">
                                {formatDistanceToNow(new Date(stream.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    )}
                </div>


            </div>



            {/* Content Details */}
            <div className="mt-3 flex gap-3">
                <UserAvatar
                    src={stream.creator.avatar}
                    name={stream.creator.name}
                    size="sm"
                    className="ring-1 ring-border"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                        {stream.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                        <span className="hover:text-foreground transition-colors">{stream.creator.name}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
