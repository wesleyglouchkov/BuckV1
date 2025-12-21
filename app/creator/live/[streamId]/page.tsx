"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2 } from "lucide-react";
import StreamChat from "@/components/live/StreamChat";
import { creatorService } from "@/services/creator";
import { SkeletonLiveStream } from "@/components/ui/skeleton-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import StreamPreviewOverlay from "@/components/live/StreamPreviewOverlay";
import StreamSetupCard from "@/components/live/StreamSetupCard";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraLiveStream = dynamic(() => import("@/components/live/AgoraLiveStream"), { ssr: false })

export default function CreatorLivePage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const urlStreamId = params.streamId as string; // ID from URL (for scheduled streams or after going live)

    // Stream state - no backend call needed for preview
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [isLive, setIsLive] = useState(false);
    const [isGoingLive, setIsGoingLive] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isLoadingStream, setIsLoadingStream] = useState(false);
    const [agoraToken, setAgoraToken] = useState<string>(""); // Token from backend for Agora
    const [uid, setUid] = useState<number>(0);
    const [isStopped, setIsStopped] = useState(false); // Stop camera/stream before navigation

    // For scheduled streams, fetch stream data on load
    // For live streams (redirected from preview), the stream is already active
    useEffect(() => {
        const fetchStreamData = async () => {
            if (!urlStreamId || !session?.user?.id) return;

            setIsLoadingStream(true);
            try {
                // Try to get stream token/data - if stream is already live, this will work
                const response = await creatorService.getStreamToken(urlStreamId, session.user.id, 'publisher');
                if (response.success && response.stream) {
                    setStreamTitle(response.stream.title || "");
                    setStreamType(response.stream.workoutType || "");
                    if (response.token) {
                        setUid(response.uid);
                        setAgoraToken(response.token);
                    }
                    if (response.stream.isLive) {
                        setIsLive(true);
                    }
                }
            } catch {
                console.log("Could not fetch stream data - showing preview mode");
            } finally {
                setIsLoadingStream(false);
            }
        };

        if (status === "authenticated") {
            fetchStreamData();
        }
    }, [urlStreamId, session?.user?.id, status]);

    // Warn user before leaving/refreshing when live OR handle browser back button
    useEffect(() => {
        // Handle page reload/close
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isLive) return;
            e.preventDefault();
            // Most modern browsers will show a generic message, but we set returnValue for compatibility
            e.returnValue = "You are currently live streaming. Are you sure you want to leave?";
            return e.returnValue;
        };

        // Handle browser back button
        const handlePopState = () => {
            if (!isLive) return;

            const confirmed = window.confirm("You are currently live streaming. Are you sure you want to leave? This will end your stream.");
            if (!confirmed) {
                // Push state back to prevent navigation
                window.history.pushState(null, "", window.location.href);
            } else {
                // Stop the stream/camera and navigate
                setIsStopped(true);
                // Allow the navigation to proceed after cleanup
                setTimeout(() => {
                    window.location.href = "/creator/schedule";
                }, 100);
            }
        };

        // Push initial state to enable popstate handling
        window.history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isLive]);

    const canGoLive = streamTitle.trim() !== "" && streamType.trim() !== "" && hasPermission !== false;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

    // Handle going live for a SCHEDULED STREAM (stream already exists in DB)
    const handleGoLive = async () => {
        if (!session?.user?.id) return;
        setIsGoingLive(true);

        try {
            // For scheduled streams, update the status to live
            const statusResponse = await creatorService.changeLiveStatus(urlStreamId, { isLive: true });

            if (statusResponse.success) {
                // Now get the Agora token for streaming
                const tokenResponse = await creatorService.getStreamToken(urlStreamId, session.user.id, 'publisher');
                if (tokenResponse.success && tokenResponse.token) {
                    setAgoraToken(tokenResponse.token);
                }
                setIsLive(true);
                toast.success("You're live! 🎬");
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        } catch (error: unknown) {
            toast.error("Failed to start stream. Please try again.");
            console.error("Go Live Error:", error);
        } finally {
            setIsGoingLive(false);
        }
    };

    // Handle recording ready
    const handleRecordingReady = useCallback((blob: Blob) => {
        setRecordingBlob(blob);
    }, []);

    // Handle permission change
    const handlePermissionChange = useCallback((hasPermission: boolean) => {
        setHasPermission(hasPermission);
    }, []);

    const handleGrantPermissions = () => {
        // Request permissions again
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(() => setHasPermission(true))
            .catch(() => setHasPermission(false));
    };

    // Handle stream end
    const handleStreamEnd = async () => {
        // Only run stream end logic if they were actually live
        if (!isLive) {
            router.push("/creator/schedule");
            return;
        }

        try {
            // If we have a recording blob, upload it
            if (recordingBlob) {
                toast.loading("Uploading recording...");

                const filename = `${urlStreamId}_${Date.now()}.webm`;
                const { uploadUrl, key } = await creatorService.getS3UploadUrl(urlStreamId, filename);

                // Upload to S3
                await fetch(uploadUrl, {
                    method: "PUT",
                    body: recordingBlob,
                    headers: {
                        "Content-Type": "video/webm",
                    },
                });

                const s3Url = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

                // Update backend: stream ended with replay URL
                await creatorService.stopStream(urlStreamId, s3Url);
                toast.dismiss();
            }
            else {
                // Update backend: stream ended without replay
                await creatorService.stopStream(urlStreamId);
            }

            setIsLive(false);
            toast.success("Stream ended successfully!");
            window.location.href = "/creator/content";
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to end stream properly";
            toast.error(message);
            window.location.href = "/creator/schedule";
        }
    };

    // Handle share - just copy link to clipboard
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/live/${urlStreamId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Stream link copied to clipboard!");
    };

    // Show loading only for auth
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SkeletonLiveStream />
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border/20 p-4 space-y-3">
                                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                                if (isLive) {
                                    const confirmed = window.confirm("You are currently live streaming. Are you sure you want to leave? This will end your stream.");
                                    if (!confirmed) return;
                                }
                                // Stop the stream/camera first
                                setIsStopped(true);
                                // Wait for cleanup to complete
                                await new Promise(resolve => setTimeout(resolve, 100));
                                window.location.href = "/creator/schedule";
                            }}
                        >
                            <ArrowLeft className="w-5 h-5 dark:text-white" />
                        </Button>
                        <div>
                            <h1 className="font-semibold text-foreground">
                                {isLive ? streamTitle : "Stream Preview"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isLive ? "Broadcasting live" : "Test your setup before going live"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isLive && (
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Live Stream and Preview Overlay */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            {/* AgoraLiveStream handles preview mode internally when isLive=false */}
                            {!isStopped ? (
                                <AgoraLiveStream
                                    appId={appId}
                                    channelName={urlStreamId}
                                    token={agoraToken}
                                    uid={uid}
                                    streamId={urlStreamId}
                                    isLive={isLive}
                                    onStreamEnd={handleStreamEnd}
                                    onRecordingReady={handleRecordingReady}
                                    onPermissionChange={handlePermissionChange}
                                />
                            ) : (
                                <div className="w-full aspect-video bg-card rounded-xl border border-border" />
                            )}

                            {/* PREVIEW: Overlay */}
                            {!isLive && (
                                <StreamPreviewOverlay
                                    isLive={isLive}
                                    hasPermission={hasPermission}
                                    isGoingLive={isGoingLive}
                                    canGoLive={canGoLive}
                                    streamTitle={streamTitle}
                                    streamType={streamType}
                                    onGoLive={handleGoLive}
                                    onGrantPermissions={handleGrantPermissions}
                                />
                            )}
                        </div>

                        {/* Stream Setup - Below Video when LIVE only */}
                        {isLive && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Title</p>
                                            <p className="font-medium">{streamTitle}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Type</p>
                                            <p className="font-medium">{streamType}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        {isLive ? (
                            <StreamChat
                                streamId={urlStreamId}
                                currentUserId={session?.user?.id}
                                currentUsername={session?.user?.name || "Creator"}
                                isCreator={true}
                            />
                        ) : (
                            <StreamSetupCard
                                title={streamTitle}
                                onTitleChange={setStreamTitle}
                                type={streamType}
                                onTypeChange={setStreamType}
                            />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
