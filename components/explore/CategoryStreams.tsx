"use client";

import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { CATEGORIES, WorkoutCategory } from "@/lib/constants/categories";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock stream data grouped by category
const generateMockStreams = () => {
    const streams: Record<string, any[]> = {};

    // HIIT streams
    streams["HIIT"] = [
        { id: "hiit-1", title: "Morning HIIT Blast - Full Body Burn", replayUrl: "creators/mock/streams/hiit1.mp4", thumbnail: null, createdAt: new Date(Date.now() - 86400000), duration: 2700, viewerCount: 1250, isLive: true, creator: { id: "fitcoach", name: "FitCoach", avatar: null } },
        { id: "hiit-2", title: "30-Minute Tabata Challenge", replayUrl: "creators/mock/streams/hiit2.mp4", thumbnail: null, createdAt: new Date(Date.now() - 172800000), duration: 1800, views: 3400, isLive: false, creator: { id: "hiitqueen", name: "HIITQueen", avatar: null } },
        { id: "hiit-3", title: "HIIT for Beginners - No Equipment", replayUrl: "creators/mock/streams/hiit3.mp4", thumbnail: null, createdAt: new Date(Date.now() - 259200000), duration: 2400, views: 2100, isLive: false, creator: { id: "fitcoach", name: "FitCoach", avatar: null } },
    ];

    // Yoga streams
    streams["Yoga"] = [
        { id: "yoga-1", title: "Sunrise Yoga Flow - Wake Up Refreshed", replayUrl: "creators/mock/streams/yoga1.mp4", thumbnail: null, createdAt: new Date(Date.now() - 43200000), duration: 3600, viewerCount: 890, isLive: true, creator: { id: "yogamaster", name: "YogaMaster", avatar: null } },
        { id: "yoga-2", title: "Evening Wind Down - Relaxation Yoga", replayUrl: "creators/mock/streams/yoga2.mp4", thumbnail: null, createdAt: new Date(Date.now() - 345600000), duration: 2700, views: 4500, isLive: false, creator: { id: "zenflow", name: "ZenFlow", avatar: null } },
    ];

    // Strength Training streams
    streams["Strength Training"] = [
        { id: "strength-1", title: "Upper Body Strength - Build Muscle", replayUrl: "creators/mock/streams/strength1.mp4", thumbnail: null, createdAt: new Date(Date.now() - 129600000), duration: 3000, views: 2800, isLive: false, creator: { id: "strengthguru", name: "StrengthGuru", avatar: null } },
        { id: "strength-2", title: "Lower Body Power Session", replayUrl: "creators/mock/streams/strength2.mp4", thumbnail: null, createdAt: new Date(Date.now() - 432000000), duration: 3300, views: 1950, isLive: false, creator: { id: "powerlift", name: "PowerLift", avatar: null } },
    ];

    // Dance streams
    streams["Dance"] = [
        { id: "dance-1", title: "Cardio Dance Party - Let's Move!", replayUrl: "creators/mock/streams/dance1.mp4", thumbnail: null, createdAt: new Date(Date.now() - 21600000), duration: 2400, viewerCount: 1560, isLive: true, creator: { id: "dancefit", name: "DanceFit", avatar: null } },
    ];

    // Boxing streams
    streams["Boxing"] = [
        { id: "boxing-1", title: "Boxing Fundamentals - Jab & Cross", replayUrl: "creators/mock/streams/boxing1.mp4", thumbnail: null, createdAt: new Date(Date.now() - 518400000), duration: 2100, views: 3200, isLive: false, creator: { id: "boxingchamp", name: "BoxingChamp", avatar: null } },
    ];

    return streams;
};

interface CategoryStreamsProps {
    isLoading?: boolean;
}

export function CategoryStreams({ isLoading = false }: CategoryStreamsProps) {
    const mockStreams = generateMockStreams();

    // Flatten all streams for thumbnail signing
    const allStreams = Object.values(mockStreams).flat();
    const signedThumbnails = useSignedThumbnails(allStreams);

    // Get categories that have streams
    const categoriesWithStreams = CATEGORIES.filter(
        (cat: WorkoutCategory) => mockStreams[cat.name] && mockStreams[cat.name].length > 0
    );

    if (isLoading) {
        return (
            <div className="space-y-12">
                {Array.from({ length: 3 }).map((_, catIndex) => (
                    <section key={catIndex}>
                        <div className="h-8 w-48 bg-muted animate-pulse mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-[220px]" />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    if (categoriesWithStreams.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-muted-foreground">No streams available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {categoriesWithStreams.map((category: WorkoutCategory) => {
                const streams = mockStreams[category.name];
                const IconComponent = category.icon;

                return (
                    <section key={category.id} id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10">
                                    <IconComponent className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
                                <span className="text-sm text-muted-foreground">
                                    {streams.length} {streams.length === 1 ? "stream" : "streams"}
                                </span>
                            </div>
                            <Link
                                href={`/explore?tab=streams&category=${encodeURIComponent(category.name)}`}
                                className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                            >
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Streams Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {streams.slice(0, 4).map((stream) => (
                                <VideoCard
                                    key={stream.id}
                                    stream={stream}
                                    signedThumbnailUrl={signedThumbnails[stream.id]}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
