"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Users } from "lucide-react";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraViewer = dynamic<AgoraViewerProps>(() => import("../../../components/live/AgoraViewer"), { ssr: false });
import VideoPlayer from "@/components/live/VideoPlayer";
import StreamChat from "@/components/live/StreamChat";
import RecordingConsentDialog from "@/components/live/RecordingConsentDialog";
import { type AgoraViewerProps } from '../../../components/live/AgoraViewer'
import { streamService } from "@/services/stream";
import { ThemeToggle } from "@/components/ui/theme-toggle";
interface StreamDetails {
    id: string;
    title: string;
    workoutType?: string;
    isLive: boolean;
    replayUrl?: string;
    creator: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface TokenData {
    token: string;
    rtmToken: string; // Separate token for RTM signaling
    uid: number;
    channelId: string;
    appId: string;
}

export default function LiveStreamPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const streamId = params.streamId as string;

    const [streamDetails, setStreamDetails] = useState<StreamDetails | null>(null);
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [viewerRole, setViewerRole] = useState<"publisher" | "subscriber" | null>(null);
    const [hasJoined, setHasJoined] = useState(false);

    // Fetch stream details and auto-join as viewer
    useEffect(() => {
        const joinStream = async (role: "publisher" | "subscriber" = "subscriber") => {
            const userId = session?.user?.id || `guest-${Math.floor(Math.random() * 1000000)}`;

            try {
                const tokenResponse = await streamService.getViewerToken(
                    streamId,
                    userId,
                    role
                );

                if (tokenResponse.success) {
                    setTokenData({
                        token: tokenResponse.token,
                        rtmToken: tokenResponse.rtmToken || "",
                        uid: tokenResponse.uid,
                        channelId: tokenResponse.channelId,
                        appId: tokenResponse.appId,
                    });
                    setViewerRole(role);
                    setHasJoined(true);
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Failed to join stream";
                toast.error(message);
            }
        };

        const fetchStreamDetails = async () => {
            try {
                const response = await streamService.getStreamDetails(streamId);

                if (response.success && response.stream) {
                    setStreamDetails(response.stream);

                    // If stream is live, attempt to join
                    if (response.stream.isLive) {
                        // Check if current user is the creator (only if logged in)
                        if (session?.user?.id && session.user.id === response.stream.creator.id) {
                            toast.info("You are the creator of this stream. Redirecting to Creator Dashboard...");
                            window.location.href = `/creator/live/${streamId}`;
                            return;
                        }
                        await joinStream("subscriber");
                    }
                } else {
                    toast.error("Stream not found");
                    router.push("/explore");
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Failed to load stream";
                toast.error(message);
                router.push("/explore");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStreamDetails();
    }, [streamId, session?.user?.id, router]);

    // Warn user before leaving/refreshing when watching live stream
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!hasJoined || !streamDetails?.isLive) return;
            e.preventDefault();
            e.returnValue = "You are watching a live stream. Are you sure you want to leave?";
            return e.returnValue;
        };

        const handlePopState = () => {
            if (!hasJoined || !streamDetails?.isLive) return;

            const confirmed = window.confirm("You are watching a live stream. Are you sure you want to leave?");
            if (!confirmed) {
                window.history.pushState(null, "", window.location.href);
            } else {
                handleLeave();
            }
        };

        window.history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [hasJoined, streamDetails?.isLive, router]);

    // Handle consent to upgrade to publisher (camera & mic)
    const handleConsent = async (participateWithVideo: boolean) => {
        console.log("handleConsent called with:", participateWithVideo);
        if (!streamDetails) {
            console.error("streamDetails is missing");
            return;
        }

        setShowConsentDialog(false);
        if (!participateWithVideo) return;

        const userId = session?.user?.id || `guest-${Math.floor(Math.random() * 1000000)}`;

        try {
            // Get publisher token from backend
            const tokenResponse = await streamService.getViewerToken(
                streamId,
                userId,
                "publisher"
            );
            if (tokenResponse.success) {
                setTokenData({
                    token: tokenResponse.token,
                    rtmToken: tokenResponse.rtmToken || "",
                    uid: tokenResponse.uid,
                    channelId: tokenResponse.channelId,
                    appId: tokenResponse.appId,
                });
                setViewerRole("publisher");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to join with camera";
            toast.error(message);
        }
    };

    // Handle leaving stream
    const handleLeave = () => {
        setHasJoined(false);
        setTokenData(null);
        setViewerRole(null);
        router.push("/explore");
    };

    // Handle share - just copy link to clipboard
    const handleShare = async () => {
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Stream link copied to clipboard!");
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading stream...</p>
                </div>
            </div>
        );
    }

    if (!streamDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Stream not found</p>
                    <Button onClick={() => router.push("/explore")}>
                        Back to Explore
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Consent Dialog */}
            {streamDetails.isLive && (
                <RecordingConsentDialog
                    open={showConsentDialog}
                    onConsent={handleConsent}
                    creatorName={streamDetails.creator.name}
                    streamTitle={streamDetails.title}
                />
            )}

            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="default"
                            size="default"
                            onClick={() => router.push("/explore")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="font-semibold text-foreground">
                                {streamDetails.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {streamDetails.creator.name}
                                {streamDetails.workoutType && ` • ${streamDetails.workoutType}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {streamDetails.isLive && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                LIVE
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Area */}
                    <div className="lg:col-span-2">
                        {streamDetails.isLive ?
                            (
                                hasJoined && tokenData && viewerRole ? (
                                    <AgoraViewer
                                        appId={tokenData.appId}
                                        channelName={tokenData.channelId}
                                        token={tokenData.token}
                                        rtmToken={tokenData.rtmToken}
                                        uid={tokenData.uid}
                                        role={viewerRole}
                                        session={session}
                                        onLeave={handleLeave}
                                        onRequestUpgrade={() => setShowConsentDialog(true)}
                                    />
                                ) : (
                                    // Condition: Stream is not live and viewer has not joined
                                    <div className="w-full aspect-video bg-linear-to-br from-card to-muted  flex items-center justify-center border border-border">
                                        <div className="text-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    Connecting to Stream
                                                </h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Joining {streamDetails.creator.name}&apos;s live stream...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                            :
                            // Condition: Stream is not live and replay is available
                            streamDetails.replayUrl ? (
                                <VideoPlayer
                                    src={streamDetails.replayUrl}
                                    title={streamDetails.title}
                                />
                            ) :
                                (
                                    // Condition: Stream is not live and no replay is available
                                    <div className="w-full aspect-video bg-linear-to-br from-card to-muted  flex items-center justify-center border border-border">
                                        <div className="text-center space-y-4">
                                            <p className="text-muted-foreground">
                                                This stream has ended and no replay is available.
                                            </p>
                                            <Button onClick={() => router.push("/explore")}>
                                                Explore More
                                            </Button>
                                        </div>
                                    </div>
                                )}
                    </div>

                    {/* Chat Sidebar */}
                    <div className="h-[500px] lg:h-auto">
                        {streamDetails.isLive && hasJoined ? (
                            <StreamChat
                                streamId={streamId}
                                currentUserId={session?.user?.id}
                                currentUsername={session?.user?.name || "Viewer"}
                                isCreator={false}
                            />
                        ) : (
                            <div className="bg-card border border-border  p-6 h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {streamDetails.isLive ? "Join to Chat" : "Chat Unavailable"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {streamDetails.isLive
                                        ? "Join the stream to participate in the live chat"
                                        : "Live chat is only available during active streams"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Creator Info */}
                <div className="mt-6 bg-card border border-border  p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            {streamDetails.creator.avatar ? (
                                <img
                                    src={streamDetails.creator.avatar}
                                    alt={streamDetails.creator.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-xl font-bold text-primary">
                                    {streamDetails.creator.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                {streamDetails.creator.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {streamDetails.workoutType || "Fitness Creator"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
