"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Video, Mic, Radio, Users, ArrowLeft, Share2, AlertTriangle } from "lucide-react";
import StreamChat from "@/components/live/StreamChat";
import { creatorService } from "@/services/creator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";
import { SkeletonLiveStream } from "@/components/ui/skeleton-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

    // Warn user before leaving/refreshing when live
    useEffect(() => {
        if (!isLive) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Most modern browsers will show a generic message, but we set returnValue for compatibility
            e.returnValue = "You are currently live streaming. Are you sure you want to leave?";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
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

    // Handle share
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/live/${urlStreamId}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: streamTitle,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Stream link copied to clipboard!");
            }
        } catch (error) {
            // User cancelled the share dialog - this is not an error
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }
            // For other errors, fall back to clipboard
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Stream link copied to clipboard!");
        }
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
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                                    {/* Logo - Top Left */}
                                    <Image
                                        src='/buck.svg'
                                        alt='go live'
                                        width={40}
                                        height={40}
                                        className="absolute top-4 left-4"
                                    />
                                    {/* Status Badge - Top Right */}
                                    <div
                                        className={cn(
                                            "absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                                            isLive
                                                ? "bg-destructive text-white"
                                                : "bg-white/20 text-white backdrop-blur-sm"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                isLive ? "bg-white animate-pulse" : "bg-white/70"
                                            )}
                                        />
                                        {isLive ? "LIVE" : "Preview"}
                                    </div>
                                    <div className="text-center space-y-6 p-8">
                                        <div className={cn(
                                            "sm:w-20 sm:h-20 sm:flex hidden rounded-full items-center justify-center mx-auto",
                                            hasPermission === false ? "bg-yellow-500/20" : "bg-destructive/20"
                                        )}>
                                            {hasPermission === false ? (
                                                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                                            ) : (
                                                <Radio className="sm:w-10 sm:h-10 text-destructive w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2 hidden sm:block">
                                                {hasPermission === false ? "Permission Required" : "Ready to go live?"}
                                            </h2>
                                            <p className="text-white/70 sm:block hidden">
                                                {hasPermission === false
                                                    ? "Please allow camera and microphone access"
                                                    : hasPermission === true
                                                        ? "Your camera and microphone are ready"
                                                        : "Checking camera and microphone..."
                                                }
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3 items-center">
                                            <Button
                                                onClick={handleGoLive}
                                                disabled={isGoingLive || !canGoLive}
                                                size="lg"
                                                className="bg-destructive hover:bg-destructive/90 text-white px-6 py-4 text-base rounded-full shadow-lg disabled:opacity-50 w-auto"
                                            >
                                                <Radio className="w-5 h-5 mr-2" />
                                                {isGoingLive ? "Starting..." : "Go Live"}
                                            </Button>
                                            {hasPermission === false && (
                                                <Button
                                                    onClick={() => {
                                                        // Request permissions again
                                                        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                                            .then(() => setHasPermission(true))
                                                            .catch(() => setHasPermission(false));
                                                    }}
                                                    variant="outline"
                                                    size="lg"
                                                    className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                                                >
                                                    Grant Permissions
                                                </Button>
                                            )}
                                        </div>
                                        {/* Status Indicators */}
                                        <div className="flex items-center justify-center gap-6 mt-4">
                                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                                <Video className={cn(
                                                    "w-4 h-4",
                                                    hasPermission === false ? "text-red-400" : "text-green-400"
                                                )} />
                                                <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Camera blocked" : "Camera ready"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                                <Mic className={cn(
                                                    "w-4 h-4",
                                                    hasPermission === false ? "text-red-400" : "text-green-400"
                                                )} />
                                                <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Mic blocked" : "Mic ready"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                                <Users className="w-4 h-4 text-blue-400" />
                                                <span className="mt-1 max-sm:text-xs">Followers and Subscribers will be notified via email</span>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-sm font-black">
                                            To go live, fill in the title and select the stream type.
                                        </div>
                                    </div>
                                </div>
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
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Stream Setup</CardTitle>
                                    {(!streamTitle.trim() || !streamType.trim()) && (
                                        <p className="text-xs text-muted-foreground">
                                            * Please fill in both fields to enable Go Live
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="streamTitle">Title</Label>
                                        <Input
                                            id="streamTitle"
                                            value={streamTitle}
                                            onChange={(e) => setStreamTitle(e.target.value)}
                                            placeholder="Enter your stream title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="streamType">Stream Type</Label>
                                        <Select
                                            value={streamType}
                                            onValueChange={setStreamType}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select workout type" />
                                            </SelectTrigger>
                                            <SelectContent className="border border-border">
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category.id} value={category.name}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
