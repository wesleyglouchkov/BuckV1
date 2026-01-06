import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoCardProps {
    stream: {
        id: string;
        title: string;
        thumbnail?: string | null;
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
    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00";
        const totalSeconds = Math.floor(seconds); // Ensure integer
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

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

    const displayThumbnail = signedThumbnailUrl || stream.thumbnail || "/placeholder-video.jpg"; // Fallback
    const viewers = stream.viewerCount || stream.views || 0;

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
                    {/* Thumbnail */}
                    <Image
                        unoptimized
                        src={displayThumbnail}
                        alt={stream.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

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
                                {formatViewers(viewers)} {stream.isLive ? 'viewers' : 'views'}
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
