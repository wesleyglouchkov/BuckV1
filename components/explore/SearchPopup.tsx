"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Radio, Search as SearchIcon, Loader2 } from "lucide-react";
import { useQuickSearch } from "@/hooks/explore";

interface SearchPopupProps {
    query: string;
    isVisible: boolean;
    onClose: () => void;
}

const formatViewerCount = (count: number) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
};

export default function SearchPopup({ query, isVisible, onClose }: SearchPopupProps) {
    const { creators, streams, isLoading } = useQuickSearch(query);

    if (!isVisible || !query.trim() || query.length < 2) return null;

    const hasResults = creators.length > 0 || streams.length > 0;

    return (
        <div
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
        >
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
            ) : !hasResults ? (
                <div className="p-8 text-center">
                    <SearchIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium truncate px-4">
                        No results found for "{query}"
                    </p>
                </div>
            ) : (
                <div className="max-h-[450px] overflow-y-auto">
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
                                                {creator.avatar ? (
                                                    <Image
                                                        src={creator.avatar}
                                                        alt={creator.name}
                                                        width={36}
                                                        height={36}
                                                        className="rounded-full object-cover aspect-square"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {creator.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
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
                                    <li key={stream.id}>
                                        <Link
                                            href={`/live/${stream.id}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-2 py-2 hover:bg-accent transition-colors group"
                                        >
                                            <div className="relative w-10 h-10 bg-muted shrink-0 overflow-hidden">
                                                {stream.thumbnail ? (
                                                    <Image
                                                        src={stream.thumbnail}
                                                        alt={stream.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-red-500/5">
                                                        <Radio className="w-5 h-5 text-red-500/40" />
                                                    </div>
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
