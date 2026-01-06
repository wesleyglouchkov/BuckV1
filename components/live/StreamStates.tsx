"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/live/VideoPlayer";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamStateProps {
    streamTitle?: string;
    creatorName?: string;
    replayUrl?: string;
    startTime?: string;
}

/**
 * Shown when stream is connecting (live stream, waiting for Agora to connect)
 */
export function StreamConnecting({ creatorName }: { creatorName: string }) {
    return (
        <div className="w-full h-[85vh] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Connecting to Stream
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Joining {creatorName}&apos;s live stream...
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Shown when a recorded stream replay is available
 */
export function StreamReplay({ replayUrl, streamTitle }: { replayUrl: string; streamTitle: string }) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSignedUrl = async () => {
            try {
                const url = await getSignedStreamUrl(replayUrl);
                if (url) {
                    setSignedUrl(url);
                } else {
                    setError("Could not load video");
                }
            } catch (err) {
                console.error("Error fetching signed URL:", err);
                setError("Could not load video");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSignedUrl();
    }, [replayUrl]);

    if (isLoading) {
        return (
            <div className="w-full h-[80vh]">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    if (error || !signedUrl) {
        return (
            <div className="w-full aspect-video bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">{error || "Video not available"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="h-[80vh]">
                <VideoPlayer
                    src={signedUrl}
                    title={streamTitle}
                />
            </div>
        </div>
    );
}

/**
 * Shown when stream is scheduled but hasn't started yet
 */
export function StreamScheduled({ startTime }: { startTime: string }) {
    const router = useRouter();

    return (
        <div className="w-full h-[85vh] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Upcoming Stream</h2>
                    <p className="text-muted-foreground">
                        This stream is scheduled to start on
                    </p>
                    <div className="text-xl font-semibold text-primary">
                        {format(new Date(startTime), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={() => router.push("/explore")} variant="outline">
                        Back to Explore
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Shown when stream has ended with no replay available
 */
export function StreamEnded() {
    const router = useRouter();

    return (
        <div className="w-full h-[85vh] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                    This stream has ended and no replay is available.
                </p>
                <Button onClick={() => router.push("/explore")}>
                    Explore More
                </Button>
            </div>
        </div>
    );
}
