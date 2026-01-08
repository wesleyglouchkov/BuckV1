"use client";

import Link from "next/link";
import { Users, Radio, Search as SearchIcon } from "lucide-react";

// Mock data types
interface Creator {
    id: number;
    name: string;
    username: string;
    avatar: string;
    followers: string;
    online: boolean;
}

interface Stream {
    id: number;
    title: string;
    creator: string;
    category: string;
    viewers: string;
}

interface SearchPopupProps {
    query: string;
    isVisible: boolean;
    onClose: () => void;
}

// Mock search results (replace with actual API calls)
const mockCreators: Creator[] = [
    { id: 1, name: "FitCoach", username: "fitcoach", avatar: "💪", followers: "54K", online: true },
    { id: 2, name: "YogaMaster", username: "yogamaster", avatar: "🧘", followers: "32K", online: false },
    { id: 3, name: "HIITQueen", username: "hiitqueen", avatar: "🔥", followers: "89K", online: true },
];

const mockStreams: Stream[] = [
    { id: 1, title: "Morning HIIT Session", creator: "FitCoach", category: "HIIT", viewers: "1.2K" },
    { id: 2, title: "Yoga Flow", creator: "YogaMaster", category: "Yoga", viewers: "890" },
    { id: 3, title: "Boxing Basics", creator: "BoxingPro", category: "Boxing", viewers: "650" },
];

export default function SearchPopup({ query, isVisible, onClose }: SearchPopupProps) {
    if (!isVisible || !query.trim()) return null;

    const lowerQuery = query.toLowerCase();

    // Filter mock data based on query
    const filteredCreators = mockCreators
        .filter(c => c.name.toLowerCase().includes(lowerQuery) || c.username.toLowerCase().includes(lowerQuery))
        .slice(0, 3);

    const filteredStreams = mockStreams
        .filter(s => s.title.toLowerCase().includes(lowerQuery) || s.creator.toLowerCase().includes(lowerQuery) || s.category.toLowerCase().includes(lowerQuery))
        .slice(0, 2);

    const hasResults = filteredCreators.length > 0 || filteredStreams.length > 0;

    return (
        <div
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
        >
            {!hasResults ? (
                <div className="p-6 text-center">
                    <SearchIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                </div>
            ) : (
                <div className="max-h-[400px] overflow-y-auto">
                    {/* Creators Section */}
                    {filteredCreators.length > 0 && (
                        <div className="p-3 border-b border-border/30">
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creators</span>
                            </div>
                            <ul>
                                {filteredCreators.map((creator) => (
                                    <li key={creator.id}>
                                        <Link
                                            href={`/explore/creator/${creator.username}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-2 py-2.5 hover:bg-accent transition-colors"
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary flex items-center justify-center text-xl">
                                                    {creator.avatar}
                                                </div>
                                                {creator.online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                                                <p className="text-xs text-muted-foreground">@{creator.username} · {creator.followers} followers</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Streams Section */}
                    {filteredStreams.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Radio className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classes</span>
                            </div>
                            <ul>
                                {filteredStreams.map((stream) => (
                                    <li key={stream.id}>
                                        <Link
                                            href={`/live/${stream.id}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-2 py-2.5 hover:bg-accent transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-red-500/10 flex items-center justify-center">
                                                <Radio className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{stream.title}</p>
                                                <p className="text-xs text-muted-foreground">{stream.creator} · {stream.category} · {stream.viewers} watching</p>
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
                <span className="text-sm font-medium text-primary">View all results for "{query}"</span>
            </Link>
        </div>
    );
}
