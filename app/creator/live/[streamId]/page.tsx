"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import StreamChat from "@/components/live/StreamChat";
import { creatorService } from "@/services/creator";
import { SkeletonLiveStream } from "@/components/ui/skeleton-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import StreamPreviewOverlay from "@/components/live/StreamPreviewOverlay";
import StreamSetupCard from "@/components/live/StreamSetupCard";
import Loader from "@/components/Loader";
import StreamExpiredCard from "@/components/live/StreamExpiredCard";
import { SharePopover } from "@/components/SharePopover";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraLiveStream = dynamic(() => import("@/components/live/AgoraLiveStream"), { ssr: false })

export default function CreatorLivePage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const urlStreamId = params.streamId as string;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

    // Stream state
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [isLive, setIsLive] = useState(false);
    const [isGoingLive, setIsGoingLive] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [agoraToken, setAgoraToken] = useState<string>(""); // Token from backend for Agora RTC
    const [rtmToken, setRtmToken] = useState<string>(""); // Separate token for RTM signaling
    const [uid, setUid] = useState<number>(0);
    const [isStopped, setIsStopped] = useState(false); // Stop camera/stream before navigation
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [streamEndLoaderState, setStreamEndLoaderState] = useState(false);
    const [recordingDetails, setRecordingDetails] = useState<{ resourceId: string; sid: string; uid: string } | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isStreamExpired, setIsStreamExpired] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    // Ref to track live state synchronously for event handlers
    const isLiveRef = useRef(false);

    // Sync ref with state
    useEffect(() => {
        isLiveRef.current = isLive;
    }, [isLive]);



    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsChatVisible(false);
        }
        if (typeof window !== 'undefined') {
            setShareUrl(`${window.location.origin}/live/${urlStreamId}`);
        }
    }, [urlStreamId]);

    // FAST-FAIL: Check session storage immediately to prevent "Live" flash on back button
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && sessionStorage.getItem(`stream-ended-${urlStreamId}`)) {
                console.log("Found local ended flag - forcing expired state");
                setIsStreamExpired(true);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [urlStreamId]);
    const canGoLive = streamTitle.trim() !== "" && streamType.trim() !== "" && hasPermission !== false;

    // Data fetching with SWR
    const fetcher = useCallback(async ([, id, userId]: [string, string, string]) => {
        // If we locally know it's expired, don't even fetch (optional optimization)
        if (typeof window !== 'undefined' && sessionStorage.getItem(`stream-ended-${id}`)) {
            return { success: true, stream: { isLive: false, endTime: new Date().toISOString() } };
        }
        return await creatorService.getStreamToken(id, userId, 'publisher');
    }, []);

    const { data: streamResponse } = useSWR(status === "authenticated" && urlStreamId && session?.user?.id ? ['stream-token', urlStreamId, session.user.id] : null, fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
    }
    );

    // Sync state with fetched data
    useEffect(() => {
        if (!streamResponse) return;

        if (streamResponse.success && streamResponse.stream) {
            setStreamTitle(streamResponse.stream.title || "");
            setStreamType(streamResponse.stream.workoutType || "");

            if (streamResponse.stream.endTime) {
                const endTime = new Date(streamResponse.stream.endTime);
                const now = new Date();
                if (now > endTime) {
                    console.log("Stream has ended");
                    setIsStreamExpired(true);
                    return;
                }
            }

            if (streamResponse.token) {
                setUid(streamResponse.uid);
                setAgoraToken(streamResponse.token);
                if (streamResponse.rtmToken) {
                    setRtmToken(streamResponse.rtmToken);
                }
            }

            if (streamResponse.stream.isLive) {
                setIsLive(true);
            } else {
                // Ensure we respect server state if it says not live
                setIsLive(false);
            }

            // Check for existing cloud recording session
            if (streamResponse.stream.resourceId && streamResponse.stream.recordingSid) {
                setRecordingDetails({
                    resourceId: streamResponse.stream.resourceId,
                    sid: streamResponse.stream.recordingSid,
                    uid: streamResponse.stream.recordingUid || "0"
                });
                setIsRecording(true);
            }
        }
    }, [streamResponse]);

    // Handle stream end
    const handleStreamEnd = useCallback(async () => {
        // Only run stream end logic if they were actually live
        if (!isLive) {
            router.push("/creator/schedule");
            return;
        }

        try {
            // Mark locally as ended immediately
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(`stream-ended-${urlStreamId}`, 'true');
            }

            // Clean up Backend: Stop stream (and recording if active)
            // This now handles everything: db update, agora stop, s3 tagging
            const result = await creatorService.stopStream(urlStreamId);

            setIsLive(false);
            setIsRecording(false);
            isLiveRef.current = false;

            // Only redirect if "everything got off" (stopStream succeeded)
            if (result) {
                window.setTimeout(() => {
                    window.location.href = "/creator/content";
                }, 1000);
            }
        } catch (error: unknown) {
            setStreamEndLoaderState(false);
            const message = error instanceof Error ? error.message : "Failed to end stream properly";
            toast.error(message);
            // Even if it failed, force local cleanup
            isLiveRef.current = false;
            window.location.href = "/creator/schedule";
        }
    }, [isLive, urlStreamId, router]);



    // Warn user before leaving/refreshing when live OR handle browser back button
    // NOTE: We no longer use sendBeacon for cleanup. The backend's heartbeat monitor
    // will automatically detect when the host stops sending heartbeats and end the stream.
    useEffect(() => {
        // Handle page reload/close - show warning to user
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isLiveRef.current) return;
            e.preventDefault();
            // Most modern browsers will show a generic message, but we set returnValue for compatibility
            e.returnValue = "You are live! If you leave, your stream will end automatically after a short delay. Your replay will be saved.";
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

        // Push initial state to enable popstate handling
        window.history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isLive, handleStreamEnd]);


    // Handle going live for a SCHEDULED STREAM (stream already exists in DB)
    const handleGoLive = async () => {
        if (!session?.user?.id) return;
        setIsGoingLive(true);

        try {
            // For scheduled streams, update the status to live
            // Backend also starts cloud recording automatically
            const statusResponse = await creatorService.changeLiveStatus(urlStreamId, { isLive: true });

            if (statusResponse.success) {
                // Set recording details from the response (backend started recording)
                if (statusResponse.isRecording && statusResponse.recordingDetails) {
                    setRecordingDetails(statusResponse.recordingDetails);
                    setIsRecording(true);
                }

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

    // Show expired stream message
    if (isStreamExpired) {
        return <StreamExpiredCard />;
    }

    // Show loading while fetching stream data
    if (!streamResponse) {
        return (
            <div className="fixed inset-0 z-100 bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                    <p className="text-lg font-medium animate-pulse dark:text-white">Loading stream...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center justify-between">
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
                            <SharePopover url={shareUrl} />
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full flex-1 min-h-0 px-4 py-0 overflow-y-auto">
                {/* Stream Info Header */}


                <div className="flex flex-col lg:flex-row h-full">

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

                                    onPermissionChange={handlePermissionChange}
                                    isChatVisible={isChatVisible}
                                    setIsChatVisible={setIsChatVisible}
                                    streamTitle={streamTitle}
                                    streamType={streamType}
                                    userName={session?.user?.name || "Creator"}
                                    userAvatar={session?.user?.avatar || undefined}
                                    recordingDetails={recordingDetails}
                                    setRecordingDetails={setRecordingDetails}
                                    isRecording={isRecording}
                                    setIsRecording={setIsRecording}
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
                            lg:static lg:h-full lg:translate-y-0 lg:bg-transparent lg:border-none lg:backdrop-blur-none
                            ${isChatVisible ? "lg:w-[25%] lg:opacity-100 lg:pointer-events-auto" : "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:ml-0"}
                        `}
                    >
                        <div className="w-full h-full">
                            {isLive ? (
                                <StreamChat
                                    streamId={urlStreamId}
                                    streamTitle={streamTitle}
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

            {/* End Stream Indicator - Bottom Right */}
            {streamEndLoaderState && (
                <div className="fixed bottom-6 right-6 z-100 bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-lg px-5 py-4 flex items-center gap-3">
                    <Loader />
                    <div className="flex flex-col">
                        <p className="text-sm font-medium dark:text-white">Ending stream...</p>
                        <p className="text-xs text-muted-foreground">Please wait, it won't take long</p>
                    </div>
                </div>
            )}
        </div>
    );
}
