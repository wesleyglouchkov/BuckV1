"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import Loader from "@/components/Loader";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraLiveStream = dynamic(() => import("@/components/live/AgoraLiveStream"), { ssr: false })

export default function CreatorLivePage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const urlStreamId = params.streamId as string;

    // Stream state
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [isLive, setIsLive] = useState(false);

    // Ref to track live status synchronously for event handlers
    const isLiveRef = useRef(false);
    // Sync ref with state
    useEffect(() => {
        isLiveRef.current = isLive;
    }, [isLive]);

    const [isGoingLive, setIsGoingLive] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isLoadingStream, setIsLoadingStream] = useState(false);
    const [agoraToken, setAgoraToken] = useState<string>(""); // Token from backend for Agora RTC
    const [rtmToken, setRtmToken] = useState<string>(""); // Separate token for RTM signaling
    const [uid, setUid] = useState<number>(0);
    const [isStopped, setIsStopped] = useState(false); // Stop camera/stream before navigation
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [streamEndLoaderState, setStreamEndLoaderState] = useState(false);
    const [recordingDetails, setRecordingDetails] = useState<{ resourceId: string; sid: string; uid: string } | null>(null);

    // Initial chat state based on screen size
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsChatVisible(false);
        }
    }, []);
    const canGoLive = streamTitle.trim() !== "" && streamType.trim() !== "" && hasPermission !== false;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
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
                        if (response.rtmToken) {
                            setRtmToken(response.rtmToken);
                        }
                    }
                    if (response.stream.isLive) {
                        setIsLive(true);
                    }
                    // Check for existing cloud recording session
                    if (response.stream.resourceId && response.stream.recordingSid) {
                        setRecordingDetails({
                            resourceId: response.stream.resourceId,
                            sid: response.stream.recordingSid,
                            uid: response.stream.recordingUid || "0"
                        });
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

    // Handle stream end
    const handleStreamEnd = useCallback(async (recordingKey?: string) => {
        // Only run stream end logic if they were actually live
        if (!isLive) {
            router.push("/creator/schedule");
            return;
        }

        try {
            // If we have a backend recording key (from Agora Cloud Recording)
            if (recordingKey) {
                // Update backend: stream ended with recording key
                await creatorService.stopStream(urlStreamId, recordingKey);
            }
            else {
                // Update backend: stream ended without replay
                await creatorService.stopStream(urlStreamId);
            }

            setIsLive(false);
            isLiveRef.current = false; // Immediately update ref to bypass unload check@
            window.setTimeout(() => {
                window.location.href = "/creator/content";
            }, 1000);
        } catch (error: unknown) {
            setStreamEndLoaderState(false);
            const message = error instanceof Error ? error.message : "Failed to end stream properly";
            toast.error(message);
            isLiveRef.current = false; // Force update ref even on error
            window.location.href = "/creator/schedule";
        }
    }, [isLive, urlStreamId, router]);


    // Warn user before leaving/refreshing when live OR handle browser back button
    useEffect(() => {
        // Handle page reload/close
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isLiveRef.current) return;
            e.preventDefault();
            // Most modern browsers will show a generic message, but we set returnValue for compatibility
            e.returnValue = "You are live! Refreshing or leaving will END the broadcast for everyone. Are you sure?";
            return e.returnValue;
        };

        // Handle browser back button
        const handlePopState = async () => {
            if (!isLiveRef.current) return;

            const confirmed = window.confirm("You are live! Leaving this page will END the broadcast for everyone. Are you sure you want to stop the stream?");
            if (!confirmed) {
                // Push state back to prevent navigation
                window.history.pushState(null, "", window.location.href);
            } else {
                // Stop the stream/camera and navigate
                setIsStopped(true);
                // Attempt to end stream properly
                await handleStreamEnd();
            }
        };

        const handleUnload = () => {
            if (isLiveRef.current) {
                // Attempt best-effort cleanup
                handleStreamEnd();
            }
        };

        // Push initial state to enable popstate handling
        window.history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("unload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("unload", handleUnload);
        };
    }, [isLive, handleStreamEnd]);


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
                    if (tokenResponse.rtmToken) {
                        setRtmToken(tokenResponse.rtmToken);
                    }
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


    // Handle share - just copy link to clipboard
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/live/${urlStreamId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Stream link copied to clipboard!");
    };

    // Show loading only for auth
    if (status === "loading") {
        return (
            <div className="bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SkeletonLiveStream />
                        </div>
                        <div className="space-y-4">
                            <div className=" border border-border/20 p-4 space-y-3">
                                <div className="h-6 w-24 bg-muted animate-pulse" />
                                <div className="h-4 w-full bg-muted animate-pulse" />
                                <div className="h-4 w-3/4 bg-muted animate-pulse" />
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
                            <h1 className="font-semibold text-foreground flex items-center gap-3">
                                {isLive ? streamTitle : "Stream Preview"}
                                {(isLive || streamType) && (
                                    <span className="px-3 py-0.5 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.15em] uppercase shadow-[0_0_10px_currentColor]">
                                        {streamType || "General"}
                                    </span>
                                )}
                            </h1>
                            <p className="mt-1 text-xs text-muted-foreground">
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
            <div className="w-full px-4 py-0">
                {/* Stream Info Header */}


                <div className="flex flex-col lg:flex-row">

                    {/* Live Stream and Preview Overlay */}
                    <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
                        <div className="relative">
                            {/* AgoraLiveStream handles preview mode internally when isLive=false */}
                            {!isStopped ? (
                                <AgoraLiveStream
                                    appId={appId}
                                    channelName={urlStreamId}
                                    token={agoraToken}
                                    rtmToken={rtmToken}
                                    uid={uid}
                                    streamId={urlStreamId}
                                    isLive={isLive}
                                    onStreamEnd={handleStreamEnd}
                                    onStreamEndLoaderStart={() => setStreamEndLoaderState(true)}
                                    onRecordingReady={handleRecordingReady}
                                    onPermissionChange={handlePermissionChange}
                                    isChatVisible={isChatVisible}
                                    setIsChatVisible={setIsChatVisible}
                                    streamTitle={streamTitle}
                                    streamType={streamType}
                                    userName={session?.user?.name || "Creator"}
                                    userAvatar={session?.user?.avatar || undefined}
                                    initialRecordingDetails={recordingDetails}
                                />
                            ) : (
                                <div className="w-full h-[85vh] bg-card border border-border" />
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
                    </div>

                    {/* Right Sidebar - Smooth Animation */}
                    <div
                        className={`
                            transition-all duration-500 ease-in-out overflow-hidden
                            
                            /* Mobile: Fixed Dialog Overlay */
                            fixed inset-0 z-50 bg-background/95 backdrop-blur-md h-dvh w-full
                            ${isChatVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}

                            /* Desktop: Sidebar */
                            lg:static lg:h-[85vh] lg:translate-y-0 lg:bg-transparent lg:border-none lg:backdrop-blur-none
                            ${isChatVisible ? "lg:w-[25%] lg:opacity-100 lg:pointer-events-auto" : "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:ml-0"}
                        `}
                    >
                        <div className="w-full h-full">
                            {isLive ? (
                                <StreamChat
                                    streamId={urlStreamId}
                                    currentUserId={session?.user?.id}
                                    currentUsername={session?.user?.name || "Creator"}
                                    isCreator={true}
                                    onClose={() => setIsChatVisible(false)}
                                    isChatVisible={isChatVisible}
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

            {/* End Stream Overlay */}
            {streamEndLoaderState && (
                <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader />
                        <p className="text-lg font-medium animate-pulse dark:text-white">Ending stream...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
