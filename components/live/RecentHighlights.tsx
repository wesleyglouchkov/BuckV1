"use client";

import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Stream {
    id: string;
    title: string;
    thumbnail: string | null;
    viewerCount: number;
    isLive: boolean;
    createdAt: string;
    replayUrl: string | null;
    workoutType?: string;
}

interface RecentHighlightsProps {
    creator: {
        id: string;
        name: string;
        username?: string;  // Optional - used for routing, falls back to id
        avatar?: string;
    };
    streams: Stream[];
    totalStreams: number;
}

export function RecentHighlights({ creator, streams, totalStreams }: RecentHighlightsProps) {
    // Process thumbnails
    const signedThumbnails = useSignedThumbnails(streams.map(s => ({
        ...s,
        replayUrl: s.replayUrl || ""
    })));

    // Use username for routing if available, otherwise use id
    const creatorRoute = creator.username || creator.id;

    if (streams.length === 0) {
        return (
            <div className="w-full px-6 pb-12">
                <h3 className="text-lg font-bold text-foreground mb-4">
                    Recent highlights and uploads
                </h3>
                <div className="text-muted-foreground text-sm">
                    No streams yet from this creator.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-6 pb-12">
            <Link href={`/explore/creator/${creatorRoute}/streams`} className="flex items-center gap-2 mb-4 group cursor-pointer">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    Recent highlights and uploads
                </h3>
                {totalStreams > 4 && (
                    <span className="text-sm text-primary font-medium flex items-center transition-all duration-300">
                        View All <ChevronRight className="w-4 h-4" />
                    </span>
                )}
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {streams.slice(0, 4).map((stream) => (
                    <VideoCard
                        key={stream.id}
                        stream={{
                            ...stream,
                            creator: {
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar || null
                            }
                        }}
                        signedThumbnailUrl={signedThumbnails[stream.id]}
                    />
                ))}
            </div>
        </div>
    );
}

// --- Previous Streams Component ---
interface PreviousStreamsProps {
    creator: {
        id: string;
        name: string;
        username?: string;  // Optional - used for routing, falls back to id
        avatar?: string;
    };
    streams: Stream[];  // Now receives previousStreams directly from API
    totalStreams: number;  // Now receives totalPreviousStreams from API
}

export function PreviousStreams({ creator, streams, totalStreams }: PreviousStreamsProps) {
    // Process thumbnails (streams are already previous/non-live from API)
    const signedThumbnails = useSignedThumbnails(streams.slice(0, 3).map(s => ({
        ...s,
        replayUrl: s.replayUrl || ""
    })));

    // Use username for routing if available, otherwise use id
    const creatorRoute = creator.username || creator.id;

    if (streams.length === 0) {
        return null;
    }

    // Show View All if there are more than 3 previous streams
    const showViewAll = totalStreams > 3;

    return (
        <div className="w-full px-6 pb-12">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                    Previous Classes
                </h3>
                {showViewAll && (
                    <Link
                        href={`/explore/creator/${creatorRoute}/streams?isLive=false`}
                        className="text-sm text-primary font-medium flex items-center gap-1 hover:underline transition-all duration-300"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.slice(0, 3).map((stream) => (
                    <VideoCard
                        key={stream.id}
                        stream={{
                            ...stream,
                            creator: {
                                id: creator.id,
                                name: creator.name,
                                username: creator.username,
                                avatar: creator.avatar || null
                            }
                        }}
                        signedThumbnailUrl={signedThumbnails[stream.id]}
                    />
                ))}
            </div>
        </div>
    );
}
