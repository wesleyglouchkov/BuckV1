"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Users, Calendar, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
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
    startTime?: string;
    endTime?: string;
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
    userName?: string;
    userAvatar?: string;
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
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    // Initial chat state based on screen size
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsChatVisible(false);
        }
    }, []);

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
        // Navigate first, then reset state (prevents "Connecting" flash)
        router.push("/explore");
        // Use setTimeout to ensure navigation starts before state reset
        setTimeout(() => {
            setHasJoined(false);
            setTokenData(null);
            setViewerRole(null);
        }, 100);
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
                <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/explore")}
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
                                    <span className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold tracking-wider uppercase rounded-full">
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
                            <UserAvatar
                                src={streamDetails.creator.avatar}
                                name={streamDetails.creator.name}
                                size="sm"
                            />

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
            <div className="w-full px-0 py-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Video Area */}
                    <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
                        <div className="w-full">
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
                                            isChatVisible={isChatVisible}
                                            onToggleChat={() => setIsChatVisible(!isChatVisible)}
                                            userName={tokenData.userName}
                                            userAvatar={tokenData.userAvatar}
                                            hostName={streamDetails.creator.name}
                                            hostAvatar={streamDetails.creator.avatar}
                                        />
                                    ) : (
                                        // Condition: Stream is not live and viewer has not joined
                                        <div className="w-full h-[85vh] bg-linear-to-br from-card to-muted  flex items-center justify-center border border-border">
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
                                    <div className="w-full h-[85vh]">
                                        <VideoPlayer
                                            src={streamDetails.replayUrl}
                                            title={streamDetails.title}
                                        />
                                    </div>
                                ) :

                                    !streamDetails.endTime && streamDetails.startTime ? (
                                        // Condition: Stream is scheduled and hasn't started/ended
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
                                                        {format(new Date(streamDetails.startTime!), "MMMM d, yyyy 'at' h:mm a")}
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <Button onClick={() => router.push("/explore")} variant="outline">
                                                        Back to Explore
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) :
                                        (
                                            // Condition: Stream is not live and no replay is available
                                            <div className="w-full h-[85vh] bg-linear-to-br from-card to-muted  flex items-center justify-center border border-border">
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
                        <ChannelInfo creator={streamDetails.creator} />
                        <RecentHighlights creator={streamDetails.creator} />
                    </div>

                    {/* Chat Sidebar */}
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
                            {streamDetails.isLive && hasJoined ? (
                                <StreamChat
                                    streamId={streamId}
                                    streamTitle={streamDetails.title}
                                    currentUserId={session?.user?.id}
                                    currentUsername={session?.user?.username || "Viewer"}
                                    isCreator={false}
                                    isChatVisible={isChatVisible}
                                    onClose={() => setIsChatVisible(false)}
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
