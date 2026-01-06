"use client";

import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock data generator since we don't have a real endpoint yet
const generateMockStreams = (creatorId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `mock-${i}`,
        title: i % 2 === 0 ? "Highlight: Best Moments of the Week" : "Full Stream: Gaming Marathon",
        thumbnail: null, // Will simulate missing thumbnail to test useSignedThumbnails or fallback
        replayUrl: "creators/cmjfamzp500084ou644652eeu/streams/cmk1dzqx50004anu6erl3zmbu/040383ba70415d6a5dec60972408a3c8_cmk1dzqx50004anu6erl3zmbu_0.mp4", // Mock URL for signing
        createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        duration: 3600 + Math.random() * 7200,
        viewerCount: Math.floor(Math.random() * 50000),
        views: Math.floor(Math.random() * 50000),
        isLive: false,
        creator: {
            id: creatorId,
            name: "Creator Name",
            avatar: null
        }
    }));
};

interface RecentHighlightsProps {
    creator: {
        id: string;
        name: string;
        avatar?: string;
    };
}

export function RecentHighlights({ creator }: RecentHighlightsProps) {
    // In a real app, fetch these from an API
    const streams = generateMockStreams(creator.id, 3);

    // Process thumbnails
    const signedThumbnails = useSignedThumbnails(streams);

    return (
        <div className="w-full px-6 pb-12">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    Recent highlights and uploads
                </h3>
                <span className="text-sm text-primary font-medium flex items-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    View All <ChevronRight className="w-4 h-4" />
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
                    <VideoCard
                        key={stream.id}
                        stream={{
                            ...stream,
                            creator: {
                                ...stream.creator,
                                name: creator.name,
                                avatar: creator.avatar
                            }
                        }}
                        signedThumbnailUrl={signedThumbnails[stream.id]}
                    />
                ))}
            </div>
        </div>
    );
}
