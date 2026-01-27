"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Users, MoreVertical } from "lucide-react";
import { SharePopover } from "@/components/SharePopover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/live/ReportDialog";
import { ChannelInfo } from "@/components/live/ChannelInfo";
import { RecentHighlights } from "@/components/live/RecentHighlights";
import { useCreatorProfile } from "@/hooks/explore";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraViewer = dynamic<AgoraViewerProps>(() => import("../../../components/live/AgoraViewer"), { ssr: false });
import StreamChat from "@/components/live/StreamChat";
import { StreamConnecting, StreamReplay, StreamScheduled, StreamEnded } from "@/components/live/StreamStates";
import RecordingConsentDialog from "@/components/live/RecordingConsentDialog";
import { type AgoraViewerProps } from '../../../components/live/AgoraViewer'
import { streamService } from "@/services/stream";
import { memberService } from "@/services/member";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { globalRTMSingleton as viewerRtmSingleton } from "@/lib/agora/rtm-singleton";
interface StreamDetails {
    id: string;
    title: string;
    workoutType?: string;
    isLive: boolean;
    replayUrl?: string;
    startTime?: string;
    endTime?: string;
    creator: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
        bio?: string;
        subscriptionPrice?: number | null;
        stripe_account_id?: string | null;
        stripe_connected?: boolean | null;
        stripe_onboarding_completed?: boolean | null;
    };
}

interface TokenData {
    token: string;
    rtmToken: string; // Separate token for RTM signaling
    uid: number;
    channelId: string;
    appId: string;
    userName?: string;
    userAvatar?: string;
}

// Component to fetch and display creator streams
function CreatorStreamsSection({
    creatorUsername,
    creator
}: {
    creatorUsername?: string;
    creator: { id: string; name: string; username?: string; avatar?: string }
}) {
    const { latestStreams, totalStreams } = useCreatorProfile(creatorUsername || null);

    return (
        <RecentHighlights
            creator={creator}
            streams={latestStreams}
            totalStreams={totalStreams}
        />
    );
}

export default function LiveStreamPage() {
    // ========== HOOKS ==========
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const streamId = params.streamId as string;

    // ========== REFS ==========
    const isNavigatingAway = useRef(false);
    const hasPushedState = useRef(false);

    // ========== STATE ==========
    const [streamDetails, setStreamDetails] = useState<StreamDetails | null>(null);
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [viewerRole, setViewerRole] = useState<"publisher" | "subscriber" | null>(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [rtmReady, setRtmReady] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [isJoiningPublisher, setIsJoiningPublisher] = useState(false);

    // ========== EFFECTS ==========

    // Initial chat state based on screen size
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsChatVisible(false);
        }
    }, []);

    // Subscribe to RTM singleton readiness - AgoraViewer initializes RTM and notifies subscribers
    useEffect(() => {
        // If already ready, set immediately
        if (viewerRtmSingleton.instance) {
            setRtmReady(true);
            return;
        }

        // Subscribe to be notified when RTM becomes ready
        const callback = (ready: boolean) => {
            setRtmReady(ready);
        };
        viewerRtmSingleton.subscribers.add(callback);

        return () => {
            viewerRtmSingleton.subscribers.delete(callback);
        };
    }, [hasJoined]); // Re-check when hasJoined changes

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
                        userName: tokenResponse?.userName,
                        userAvatar: tokenResponse?.userAvatar
                    });
                    setViewerRole(role);
                    setHasJoined(true);
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Failed to join stream";
                toast.error(message);
            }
        };

        const checkSubscriptionStatus = async (creatorId: string) => {
            if (status === "authenticated" && session?.user?.role?.toUpperCase() === "MEMBER") {
                try {
                    const result = await memberService.getCreatorRelationship(creatorId);
                    setIsSubscribed(result.isSubscribed);
                } catch (error) {
                    console.error("Failed to check subscription status:", error);
                }
            }
        };

        const fetchStreamDetails = async () => {
            try {
                const response = await streamService.getStreamDetails(streamId);

                if (response.success && response.stream) {
                    setStreamDetails(response.stream);
                    await checkSubscriptionStatus(response.stream.creator.id);

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
    }, [streamId, session?.user?.id, router, status]);



    // Warn user before leaving/refreshing when watching live stream
    useEffect(() => {
        if (!hasJoined || !streamDetails?.isLive) return;

        // Push a state to "trap" the back button once
        if (!hasPushedState.current) {
            window.history.pushState(null, "", window.location.href);
            hasPushedState.current = true;
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isNavigatingAway.current) return;
            e.preventDefault();
            e.returnValue = "You are watching a live stream. Are you sure you want to leave?";
            return e.returnValue;
        };

        const handlePopState = () => {
            // If we are already in the process of leaving, don't confirm again
            if (isNavigatingAway.current) return;

            const confirmed = window.confirm("You are watching a live stream. Are you sure you want to leave?");
            if (confirmed) {
                isNavigatingAway.current = true;
                handleLeave();
            } else {
                // If they cancel, push the state back to keep them "trapped"
                window.history.pushState(null, "", window.location.href);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [hasJoined, streamDetails?.isLive, router]);

    // ========== HANDLERS ==========

    // Handle consent to upgrade to publisher (camera & mic)
    const handleConsentUpgradeToPublisher = async (participateWithVideo: boolean) => {
        console.log("handleConsent called with:", participateWithVideo);
        if (!streamDetails) {
            console.error("streamDetails is missing");
            return;
        }

        if (!participateWithVideo) {
            setShowConsentDialog(false);
            return;
        }

        setIsJoiningPublisher(true);

        const userId = session?.user?.id || `guest-${Math.floor(Math.random() * 1000000)}`;

        try {
            // Join participation 
            await streamService.joinParticipation(streamId);

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
                setShowConsentDialog(false);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to join with camera";
            toast.error(message);
        } finally {
            setIsJoiningPublisher(false);
        }
    };

    // Handle consent downgrade to subscriber 
    const handleConsentDowngradeToSubscriber = async () => {
        console.log("handleConsentDowngradeToSubscriber called");
        if (!streamDetails) {
            console.error("streamDetails is missing");
            return;
        }

        try {
            setViewerRole("subscriber");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to join as subscriber";
            toast.error(message);
        }
    };

    // Handle leave stream
    const handleLeave = () => {
        isNavigatingAway.current = true;
        // Navigate back to where the user came from
        router.back();
        // Use setTimeout to ensure navigation starts before state reset
        setTimeout(() => {
            setHasJoined(false);
            setTokenData(null);
            setViewerRole(null);
        }, 100);
    };

    const handleAllowNavigation = () => {
        isNavigatingAway.current = true;
    };

    // ========== RENDER ==========

    if (status === "loading" || isLoading) {
        return (
            <div className="h-screen bg-background flex flex-col overflow-hidden">
                {/* Skeleton Header */}
                <div className="border-b border-border bg-card/50 px-4 py-3">
                    <Skeleton className="h-8 w-48" />
                </div>
                {/* Skeleton Video */}
                <div className="flex-1 p-4">
                    <Skeleton className="w-full h-[80vh]" />
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
        <div className="h-dvh bg-background flex flex-col overflow-hidden">
            {/* Consent Dialog */}
            {streamDetails.isLive && (
                <RecordingConsentDialog
                    open={showConsentDialog}
                    onConsent={handleConsentUpgradeToPublisher}
                    creatorName={streamDetails.creator.name}
                    streamTitle={streamDetails.title}
                    isJoining={isJoiningPublisher}
                />
            )}

            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (streamDetails.isLive) {
                                    setLeaveDialogOpen(true);
                                } else {
                                    router.back();
                                }
                            }}
                            className="shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 dark:text-white" />
                        </Button>
                        <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="font-semibold text-foreground truncate">
                                    {streamDetails.title}
                                </h1>
                                {streamDetails.workoutType && (
                                    <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase rounded-sm border border-primary/20">
                                        {streamDetails.workoutType}
                                    </span>
                                )}
                                {streamDetails.isLive && (
                                    <span className="shrink-0 hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold tracking-wider uppercase rounded-full">
                                        <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {/* Creator Info Compact */}
                        <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-none dark:text-white">{streamDetails.creator.name}</p>
                                <p className="text-[10px] text-muted-foreground">Host</p>
                            </div>


                        </div>

                        <SharePopover url={typeof window !== 'undefined' ? window.location.href : ''}>
                            <Button variant="ghost" size="icon">
                                <Share2 className="w-4 h-4 dark:text-white" />
                            </Button>
                        </SharePopover>

                        {/* Report Stream Button - Only for logged-in viewers */}
                        {session?.user?.id && session.user.id !== streamDetails.creator.id && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4 dark:text-white" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onClick={() => setReportDialogOpen(true)}
                                    >
                                        Report Stream
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full flex-1 min-h-0">
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Video Area */}
                    <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out">
                        <div className="w-full">
                            {streamDetails.isLive ? (
                                // LIVE STREAM
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
                                        onDowngrade={handleConsentDowngradeToSubscriber}
                                        onAllowNavigation={handleAllowNavigation}
                                        onRequestUpgrade={() => setShowConsentDialog(true)}
                                        isChatVisible={isChatVisible}
                                        onToggleChat={() => setIsChatVisible(!isChatVisible)}
                                        userName={tokenData.userName}
                                        userAvatar={tokenData.userAvatar}
                                        hostName={streamDetails.creator.name}
                                        hostAvatar={streamDetails.creator.avatar}
                                        hostDbId={streamDetails.creator.id}
                                        hostUsername={streamDetails.creator.username}
                                        hostSubscriptionPrice={streamDetails.creator.subscriptionPrice}
                                        isSubscribed={isSubscribed}
                                        leaveDialogOpen={leaveDialogOpen}
                                        onLeaveDialogChange={setLeaveDialogOpen}
                                    />
                                ) : (
                                    <StreamConnecting creatorName={streamDetails.creator.name} />
                                )
                            ) : streamDetails.replayUrl ? (
                                // REPLAY AVAILABLE
                                <StreamReplay
                                    replayUrl={streamDetails.replayUrl}
                                    streamTitle={streamDetails.title}
                                    creator={streamDetails.creator}
                                />
                            ) : !streamDetails.endTime && streamDetails.startTime ? (
                                // SCHEDULED (not started yet)
                                <StreamScheduled startTime={streamDetails.startTime} />
                            ) : (
                                // ENDED (no replay)
                                <StreamEnded />
                            )}
                        </div>
                        <ChannelInfo creator={streamDetails.creator} />
                        <CreatorStreamsSection creatorUsername={streamDetails.creator.username} creator={streamDetails.creator} />
                    </div>

                    {/* Chat Sidebar - Only shown for live streams */}
                    {streamDetails.isLive && (
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
                                {hasJoined ? (
                                    <StreamChat
                                        key={rtmReady ? "rtm-ready" : "rtm-connecting"}
                                        streamId={streamId}
                                        streamTitle={streamDetails.title}
                                        currentUserId={session?.user?.id}
                                        currentUsername={session?.user?.username || "Viewer"}
                                        isCreator={false}
                                        isChatVisible={isChatVisible}
                                        onClose={() => setIsChatVisible(false)}
                                        rtmManager={viewerRtmSingleton.instance}
                                    />
                                ) : (
                                    <div className="bg-card border border-border p-6 h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Join to Chat
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Join the stream to participate in the live chat
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Dialog */}
            {reportDialogOpen && (
                <ReportDialog
                    open={reportDialogOpen}
                    onOpenChange={setReportDialogOpen}
                    reportType="stream"
                    senderId={streamDetails.creator.id}
                    senderName={streamDetails.creator.name}
                    streamId={streamId}
                    streamTitle={streamDetails.title}
                    currentUserId={session?.user?.id}
                />
            )}
        </div>
    );
}
