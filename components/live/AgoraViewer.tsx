"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AgoraRTC, { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Video as VideoIcon, Users, Maximize2, ArrowRightFromLine, ArrowLeftToLine, Radio, DollarSign } from "lucide-react";
import { ParticipantGrid, ParticipantTile } from "./AgoraComponents";
import { toast } from "sonner";
import { SignalingMessage } from "@/lib/agora/agora-rtm";
import { Session } from "next-auth";
import { isViewerLoggedIn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { globalRTMSingleton as viewerRtmSingleton } from "@/lib/agora/rtm-singleton";
import { participantVideoConfig, hostVideoConfig } from "@/lib/agora/video-config";
import { useParticipantMediaState } from "@/hooks/use-participant-media-state";
import { TipButton } from "./TipButton";
import { LoginRequiredDialog } from "./LoginRequiredDialog";
import { SubscribeDialog } from "./subscribe/SubscribeDialog";
import { useStreamControlsTour } from "@/hooks/use-onboarding-tours";
import { useTrackToggle } from "@/hooks/live/use-track-toggle";
import { useRTMClient } from "@/hooks/live/use-rtm-client";
import { useParticipants } from "@/hooks/live/use-participants";
import { useStreamInfo } from "@/hooks/useStreamInfo";
import { useJoinSound } from "@/hooks/use-sound-effect";
import { VideoDeviceControl, AudioDeviceControl } from "./StreamControls";
import { StreamStatsDisplay } from "./StreamStatsDisplay";




export interface AgoraViewerProps {
    appId: string;
    channelName: string;
    token: string;
    rtmToken: string; // Separate token for RTM signaling
    uid: number;
    role: "publisher" | "subscriber";
    hostUid?: number; // Optional: Explicit host UID
    session: Session | null; // User session for checking login status
    onLeave: () => void;
    onDowngrade?: () => void;
    onAllowNavigation?: () => void;
    onRequestUpgrade: () => void;
    isChatVisible?: boolean;
    onToggleChat?: () => void;
    // New optional props for user identity
    userName?: string;
    userAvatar?: string;
    hostName?: string;
    hostAvatar?: string;
    hostDbId?: string;
    hostUsername?: string;
    hostSubscriptionPrice?: number | null;
    isSubscribed?: boolean;
    leaveDialogOpen?: boolean; // Controlled state for leave dialog
    onLeaveDialogChange?: (open: boolean) => void; // Callback when dialog state changes
}

function StreamLogic(props: AgoraViewerProps) {
    const { appId, channelName, token, rtmToken, uid, role, hostUid, session, onLeave, onAllowNavigation, onRequestUpgrade, isChatVisible, onToggleChat, userName, userAvatar, hostName, hostAvatar, hostDbId, hostUsername, hostSubscriptionPrice, isSubscribed = false, leaveDialogOpen, onLeaveDialogChange, onDowngrade } = props;
    const router = useRouter();

    // ========== STATE ==========
    const [hasEnteredStream, setHasEnteredStream] = useState(false);
    const [isClientRoleSet, setIsClientRoleSet] = useState(false);
    const [userNames, setUserNames] = useState<Record<string, { name: string; avatar?: string; isRecording?: boolean }>>({});
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
    const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);
    const [internalLeaveDialogOpen, setInternalLeaveDialogOpen] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const showLeaveDialog = leaveDialogOpen !== undefined ? leaveDialogOpen : internalLeaveDialogOpen;
    const setShowLeaveDialog = (open: boolean) => {
        if (onLeaveDialogChange) {
            onLeaveDialogChange(open);
        } else {
            setInternalLeaveDialogOpen(open);
        }
    };

    // ========== REFS ==========
    const hostContainerRef = useRef<HTMLDivElement>(null);

    // ========== AGORA HOOKS ==========
    const remoteUsers = useRemoteUsers();
    const { localCameraTrack } = useLocalCameraTrack(role === "publisher", { encoderConfig: hostVideoConfig });
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(role === "publisher");
    const client = useRTCClient();
    const participantMediaState = useParticipantMediaState(client);
    const { isVideoEnabled, setIsVideoEnabled, isAudioEnabled, setIsAudioEnabled } = useTrackToggle(localCameraTrack, localMicrophoneTrack);
    const { participantCount, viewerCount } = useStreamInfo(channelName);
    const playJoinSound = useJoinSound();

    // ========== DERIVED VALUES ==========
    const isHost = role === "publisher";
    const canPublish = role === "publisher" && isClientRoleSet;
    const viewerIsLoggedIn = isViewerLoggedIn(session);
    const hostUser = hostUid ? remoteUsers.find(u => u.uid === hostUid) : remoteUsers[0];
    const otherRemoteUsers = hostUid ? remoteUsers.filter(u => u.uid !== hostUid) : remoteUsers.slice(1);

    // ========== TOUR ==========
    const { startTour } = useStreamControlsTour({ isHost, hasJoined: hasEnteredStream });

    // ========== AGORA CHANNEL EFFECTS ==========
    // Join channel
    useJoin({ appid: appId, channel: channelName, token: token, uid: uid });

    // Publish tracks if role is publisher AND client role has been set
    usePublish([localCameraTrack, localMicrophoneTrack], canPublish);

    // Handle role switching - MUST complete before publishing in ILS mode
    useEffect(() => {
        if (client) {
            const targetRole = role === "publisher" ? "host" : "audience";
            setIsClientRoleSet(false);

            const changeRole = async () => {
                try {
                    // If switching to audience and currently publishing, unpublish first
                    if (targetRole === "audience" && client.localTracks.length > 0) {
                        if (process.env.NODE_ENV === 'development') console.log("Unpublishing tracks before switching to audience...");
                        await client.unpublish(client.localTracks);
                    }

                    await client.setClientRole(targetRole);
                    if (process.env.NODE_ENV === 'development') console.log("Viewer: Client role set successfully to:", targetRole);
                    setIsClientRoleSet(true);
                } catch (err) {
                    console.error("Failed to set client role:", err);
                    setIsClientRoleSet(false);
                }
            };

            changeRole();
        }
    }, [client, role]);

    // Sync RTM UID with actual RTC UID
    useEffect(() => {
        if (client && client.uid) {
            viewerRtmSingleton.currentUidRef.current = client.uid as number;
        } else {
            viewerRtmSingleton.currentUidRef.current = uid;
        }
    }, [client, client?.uid, uid]);

    // Handle Agora client errors gracefully
    useEffect(() => {
        if (!client) return;
        const handleException = (event: { code: string; msg: string; uid?: string | number }) => {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Agora client exception (handled gracefully):', event);
            }
            if (event.code === 'INVALID_REMOTE_USER') return;
        };
        const handleUserJoined = (user: { uid: string | number }) => {
            playJoinSound();
        };

        client.on('exception', handleException);
        client.on('user-joined', handleUserJoined);
        return () => {
            client.off('exception', handleException);
            client.off('user-joined', handleUserJoined);
        };
    }, [client, playJoinSound]);

    // Trigger tour when user enters stream
    useEffect(() => {
        if (hasEnteredStream) {
            const timer = setTimeout(() => { startTour(); }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasEnteredStream, startTour]);

    // Auto-show participants when user becomes a publisher
    useEffect(() => {
        if (role === "publisher") {
            setIsParticipantsVisible(true);
            setHasEnteredStream(true);
        }
    }, [role]);

    // Handle leaving the stream - used by RTM kick command
    const handleLeaveStream = useCallback(async () => {
        // Close local tracks if publisher
        if (role === "publisher") {
            localCameraTrack?.close();
            localMicrophoneTrack?.close();
        }

        // Leave Agora channel
        try {
            await client.leave();
            console.log("Viewer: Left Agora channel");
        } catch (err) {
            console.warn("Viewer: Error leaving channel:", err);
        }

        router.push('/explore');
    }, [client, localCameraTrack, localMicrophoneTrack, role, router]);

    // Helper function to send USER_ANNOUNCE - used on RTM ready and when host requests
    const sendUserAnnounce = useCallback(() => {
        if (viewerRtmSingleton.instance && userName) {
            viewerRtmSingleton.instance.sendMessage({
                type: "USER_ANNOUNCE",
                payload: {
                    userId: uid,
                    name: userName,
                    avatar: userAvatar
                }
            }).catch(() => { });
        }
    }, [uid, userName, userAvatar]);

    // Message handler for RTM commands from host and announcements from other viewers
    const handleRTMMessage = useCallback((msg: SignalingMessage) => {
        // Handle HOST_REQUEST_ANNOUNCE - host is asking all viewers to announce themselves
        if (msg.type === "HOST_REQUEST_ANNOUNCE") {
            sendUserAnnounce();
            return;
        }

        // Handle USER_ANNOUNCE - another viewer announcing their name
        if (msg.type === "USER_ANNOUNCE" && msg.payload) {
            const { userId, name, avatar } = msg.payload;
            if (userId && name) {
                setUserNames(prev => {
                    const existing = prev[userId.toString()];
                    return {
                        ...prev,
                        [userId.toString()]: {
                            ...existing,
                            name,
                            avatar
                        }
                    };
                });
            }
            return;
        }

        if (!msg.payload || !('userId' in msg.payload)) return;

        const targetUid = msg.payload.userId.toString().trim();
        const myRtcUid = viewerRtmSingleton.currentUidRef.current?.toString().trim() || '';
        const myLoginUid = uid.toString().trim();

        const isMe = targetUid === myRtcUid || targetUid === myLoginUid;

        if (msg.type === "MUTE_USER" && isMe) {
            if (msg.payload.mediaType === "audio") {
                const newState = !msg.payload.mute;
                setIsAudioEnabled(newState);
                toast.info(newState ? "The host has unmuted your microphone" : "The host has muted your microphone");
            }
            else if (msg.payload.mediaType === "video") {
                const newState = !msg.payload.mute;
                setIsVideoEnabled(newState);
                toast.info(newState ? "The host has enabled your camera" : "The host has disabled your camera");
            }
        }
        else if (msg.type === "KICK_USER" && isMe) {
            toast.error("You have been removed from the stream by the host.");
            handleLeaveStream();
        }
    }, [uid, handleLeaveStream, sendUserAnnounce]);

    // Handle Presence Updates
    const handleRTMPresence = useCallback((p: { userId: string, name?: string, avatar?: string, isOnline: boolean, isRecording?: boolean }) => {
        if (p.isOnline) {
            setUserNames(prev => {
                const existing = prev[p.userId];
                const displayName = p.name || existing?.name || `User ${p.userId}`;
                const displayAvatar = p.avatar || existing?.avatar;
                const isRecording = p.isRecording !== undefined ? p.isRecording : existing?.isRecording;

                if (existing?.name === displayName && existing?.avatar === displayAvatar && existing?.isRecording === isRecording) {
                    return prev;
                }

                return {
                    ...prev,
                    [p.userId]: { name: displayName, avatar: displayAvatar, isRecording }
                };
            });
        }
    }, []);

    // --- Signaling (RTM) Implementation using Hook ---
    const { isRTMReady, cleanupRTM, fetchUsersFromChannelMetadata } = useRTMClient({
        appId,
        channelName,
        uid,
        rtmToken,
        userName,
        userAvatar,
        role: role === 'publisher' ? 'host' : 'viewer',
        onMessage: handleRTMMessage,
        onPresence: handleRTMPresence
    });

    // Send USER_ANNOUNCE and fetch other participants when RTM is ready
    useEffect(() => {
        if (isRTMReady && userName) {
            // Send our name announcement
            const timer = setTimeout(() => {
                sendUserAnnounce();
            }, 500);

            // Fetch other participants from channel metadata
            fetchUsersFromChannelMetadata().then(usersMap => {
                if (usersMap.size > 0) {
                    setUserNames(prev => {
                        const updated = { ...prev };
                        usersMap.forEach((userData, odUserId) => {
                            if (!updated[odUserId]?.name || updated[odUserId]?.name?.startsWith("User ")) {
                                updated[odUserId] = {
                                    ...updated[odUserId],
                                    name: userData.name,
                                    avatar: userData.avatar
                                };
                            }
                        });
                        return updated;
                    });
                }
            }).catch(() => { });

            return () => clearTimeout(timer);
        }
    }, [isRTMReady, userName, sendUserAnnounce, fetchUsersFromChannelMetadata]);

    // Store cleanupRTM in ref for stable access in finalHandleLeaveStream
    const cleanupRTMRef = useRef(cleanupRTM);
    useEffect(() => { cleanupRTMRef.current = cleanupRTM; }, [cleanupRTM]);

    // Handle browser fullscreen for host video
    const handleHostFullscreen = () => {
        if (hostContainerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                hostContainerRef.current.requestFullscreen();
            }
        }
    };

    // Final leave handler with RTM cleanup (used by UI Leave button)
    const finalHandleLeaveStream = useCallback(async () => {
        cleanupRTMRef.current(); // Use ref to avoid circular dependency or ordering issues

        // Close local tracks if publisher
        if (role === "publisher") {
            localCameraTrack?.close();
            localMicrophoneTrack?.close();
        }

        // Leave Agora channel
        try {
            await client.leave();
            console.log("Viewer: Left Agora channel");
        } catch (err) {
            console.warn("Viewer: Error leaving channel:", err);
        }

        router.push('/explore');
    }, [client, localCameraTrack, localMicrophoneTrack, role, router]);

    // ========== PARTICIPANTS ==========

    const allParticipants = useParticipants({
        uid,
        userName,
        localCameraTrack,
        localMicrophoneTrack,
        isVideoEnabled,
        isAudioEnabled,
        remoteUsers: otherRemoteUsers,
        userNames,
        participantMediaState,
        includeLocal: role === 'publisher'
    });

    // Filter participants for visibility based on login status
    const participants = viewerIsLoggedIn ? allParticipants : allParticipants.filter(p => p.isLocal);


    const handleJoinRequest = () => {
        if (viewerIsLoggedIn) {
            onRequestUpgrade();
        } else {
            setShowLoginDialog(true);
        }
    };

    // Handle entering stream - this provides user interaction for audio
    const handleEnterStream = async () => {
        console.log('Viewer: Entering stream');
        setHasEnteredStream(true);

        // Play any existing audio tracks
        for (const user of remoteUsers) {
            if (user.audioTrack && user.hasAudio) {
                try {
                    await user.audioTrack.play();
                    console.log(`Viewer: Enabled audio for user ${user.uid}`);
                } catch (err) {
                    console.warn(`Viewer: Failed to play audio for user ${user.uid}:`, err);
                }
            }
        }
    };


    return (
        <div className="relative w-full h-[75vh] flex flex-col md:flex-row bg-background overflow-hidden shadow-2xl group/main">
            {/* Enter Stream Overlay - Captures user interaction for audio */}
            {!hasEnteredStream && role === "subscriber" && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md mx-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white">Ready to Join?</h2>
                            <p className="text-white">
                                Click below to enter the live stream
                            </p>
                        </div>
                        <Button
                            onClick={handleEnterStream}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
                        >
                            Enter Stream
                        </Button>
                    </div>
                </div>
            )}

            {/* 1. HOST (Main Screen / Left on Desktop) */}
            <div ref={hostContainerRef} className="flex-1 relative order-1 md:order-1 overflow-hidden bg-black flex items-center justify-center group/host" data-tour="video-area">
                {hostUser ? (
                    <div className="w-full h-full relative">
                        <ParticipantTile
                            participant={{
                                uid: hostUser.uid,
                                name: hostName || userNames[hostUser.uid.toString()]?.name || "Host",
                                videoTrack: hostUser.videoTrack,
                                audioTrack: hostUser.audioTrack,
                                isLocal: false,
                                cameraOn: participantMediaState[hostUser.uid.toString()]?.hasVideo ?? hostUser.hasVideo,
                                micOn: participantMediaState[hostUser.uid.toString()]?.hasAudio ?? hostUser.hasAudio,
                                agoraUser: hostUser
                            }}
                            className="w-full h-full rounded-none border-none aspect-auto md:aspect-auto"
                            customControls={
                                <div
                                    className="flex items-center justify-center cursor-pointer backdrop-blur-md shadow-sm transition-all duration-300 h-7 w-auto px-2 md:w-7 md:px-0 gap-1.5 md:gap-0 bg-primary text-white border border-white/10 hover:bg-primary/90"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleChat?.();
                                    }}
                                    data-tour="chat-toggle"
                                >
                                    {isChatVisible ? (
                                        <ArrowRightFromLine className="w-3.5 h-3.5" />
                                    ) : (
                                        <ArrowLeftToLine className="w-3.5 h-3.5" />
                                    )}
                                    <span className="text-[10px] font-medium md:hidden whitespace-nowrap">
                                        {isChatVisible ? "Hide Chat" : "Show Chat"}
                                    </span>
                                </div>
                            }
                        />

                        {/* REC Badge Overlay (Bottom Right on mobile) */}
                        {userNames[hostUser.uid.toString()]?.isRecording && (
                            <div className="absolute bottom-4 right-4 z-20 pointer-events-none flex items-center gap-1.5 bg-destructive px-2 py-0.5 rounded shadow-lg border border-white/10">
                                <Radio className="w-3 h-3 animate-pulse text-white" />
                                <span className="font-bold text-[10px] uppercase text-white mt-0.5">Rec</span>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-0">
                        <div className="text-center flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <Users className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight">Waiting for Host</h3>
                                <p className="text-neutral-400 text-sm">The broadcast will begin shortly...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Viewer Count & Live Badge Overlay */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 pointer-events-none flex items-center gap-3">
                    <StreamStatsDisplay
                        isLive={true}
                        viewerCount={viewerCount} // Use API viewer count
                        participantCount={participantCount}
                        className="pointer-events-auto"
                    />
                </div>

                {/* Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Controls Overlay (Always Visible, Bottom Fixed) */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-background/60 backdrop-blur-md px-4 py-3 border-t border-white/10 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" data-tour="stream-controls">

                {hostDbId && (
                    <TipButton creatorId={hostDbId} livestreamId={channelName} asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="w-9 h-9 shadow-lg shadow-green-500/20 bg-linear-to-tr from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-2 border-white/20 hover:scale-110 transition-all duration-300"
                            title="Send BUCK"
                            data-tour="tip-button"
                        >
                            <DollarSign className="w-4 h-4 fill-white" />
                        </Button>
                    </TipButton>
                )}

                {role === "publisher" && (
                    <div className="flex items-center gap-2" data-tour="media-controls">
                        <VideoDeviceControl
                            isVideoEnabled={isVideoEnabled}
                            onToggle={() => setIsVideoEnabled(!isVideoEnabled)}
                            currentCameraTrack={localCameraTrack}
                        />

                        <AudioDeviceControl
                            isAudioEnabled={isAudioEnabled}
                            onToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                            currentMicTrack={localMicrophoneTrack}
                        />
                        <div className="w-px h-6 bg-white/20 mx-2" />
                    </div>
                )}

                {role === "subscriber" ? (
                    <Button
                        onClick={handleJoinRequest}
                        variant="default"
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-xs md:text-sm"
                        data-tour="join-stream-btn"
                    >
                        <VideoIcon className="w-4 h-4" />
                        Join Stream
                    </Button>
                ) :
                    <Button
                        onClick={onDowngrade}
                        variant="default"
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-xs md:text-sm"
                        data-tour="join-stream-btn"
                    >
                        <VideoIcon className="w-4 h-4" />
                        Leave Participation
                    </Button>


                }

                <Button
                    onClick={() => setIsParticipantsVisible(!isParticipantsVisible)}
                    variant={isParticipantsVisible ? "secondary" : "ghost"}
                    size="icon"
                    className={`w-10 h-10 shadow-lg hover:bg-accent hover:text-accent-foreground border ${!isParticipantsVisible ? "border-primary dark:border-transparent" : "border-transparent"}`}
                    title={isParticipantsVisible ? "Hide Participants" : "Show Participants"}
                    data-tour="participants-grid"
                >
                    <Users className="w-4 h-4 dark:text-white" />
                </Button>

                <div className="w-px h-6 bg-border mx-2" />

                <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

                {hostDbId && (
                    <SubscribeDialog
                        creator={{
                            id: hostDbId,
                            name: hostName || "Host",
                            username: hostUsername,
                            avatar: hostAvatar,
                            subscriptionPrice: hostSubscriptionPrice
                        }}
                        open={showSubscribeDialog}
                        onOpenChange={setShowSubscribeDialog}
                        onAllowNavigation={onAllowNavigation}
                    >
                        <div className="hidden" />
                    </SubscribeDialog>
                )}

                <Button
                    variant="destructive"
                    size="icon"
                    className="w-10 h-10 shadow-lg hover:bg-destructive/80 transition-all shadow-destructive/20"
                    data-tour="end-stream-btn"
                    onClick={() => setShowLeaveDialog(true)}
                >
                    <PhoneOff className="w-4 h-4" />
                </Button>

                <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Leave Stream</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to leave this stream?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={finalHandleLeaveStream} className="bg-destructive hover:bg-destructive/90">
                                Leave
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* 2. PARTICIPANTS (Side Grid / Bottom on Mobile) */}
            <div className={`
                order-2 md:order-2
                shrink-0
                bg-neutral-900/50 md:bg-background md:border-l md:border-border
                flex flex-col
                transition-all duration-300 ease-in-out
                z-20
                overflow-y-auto custom-scrollbar
                pb-20 md:pb-24
                ${isParticipantsVisible
                    ? "w-full md:w-[320px] lg:w-[350px] max-h-[30vh] md:max-h-full opacity-100"
                    : "w-0 md:w-0 max-h-0 md:max-h-full opacity-0 overflow-hidden border-none"}
            `}>
                <ParticipantGrid
                    participants={participants}
                    maxVisible={6}
                    onCloseChat={() => onToggleChat?.()}
                    className="grid-cols-2 lg:grid-cols-1"
                />
            </div>
        </div>
    );
}

export default function AgoraViewer(props: AgoraViewerProps) {
    // Memoize the client - CRITICAL for preventing reconnection on parent re-renders
    const client = useMemo(() => {
        return AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }, []); // Empty dependency array = created once on mount

    return (
        <AgoraRTCProvider client={client}>
            <StreamLogic {...props} />
        </AgoraRTCProvider>
    );
}
