"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AgoraRTC, { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Video as VideoIcon, Users, Maximize2, ArrowRightFromLine, ArrowLeftToLine, Radio } from "lucide-react";
import { ParticipantGrid, ParticipantTile } from "./AgoraComponents";
import { toast } from "sonner";
import { SignalingManager, SignalingMessage } from "@/lib/agora/agora-rtm";
import { Session } from "next-auth";
import { isViewerLoggedIn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { globalRTMSingleton as viewerRtmSingleton } from "@/lib/agora/rtm-singleton";
import Image from "next/image";
import { useParticipantMediaState } from "@/lib/agora/use-participant-media-state";



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
    onRequestUpgrade: () => void;
    isChatVisible?: boolean;
    onToggleChat?: () => void;
    // New optional props for user identity
    userName?: string;
    userAvatar?: string;
    hostName?: string;
    hostAvatar?: string;
}

function StreamLogic({
    appId,
    channelName,
    token,
    rtmToken,
    uid,
    role,
    hostUid,
    session,
    onLeave,
    onRequestUpgrade,
    isChatVisible,
    onToggleChat,
    userName,
    userAvatar,
    hostName,
    hostAvatar
}: AgoraViewerProps) {
    const router = useRouter();

    // Track state - start enabled so tracks can be published
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Track if user has clicked to enter stream (needed for audio autoplay)
    const [hasEnteredStream, setHasEnteredStream] = useState(false);

    // Get remote users
    const remoteUsers = useRemoteUsers();

    // Local tracks - always create if role is publisher
    const { localCameraTrack } = useLocalCameraTrack(role === "publisher");
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(role === "publisher");

    const client = useRTCClient();

    // Track if client role has been set (needed before publishing in ILS mode)
    const [isClientRoleSet, setIsClientRoleSet] = useState(false);

    // Participant Media State Map - tracks hasVideo/hasAudio reactively via Agora events
    const participantMediaState = useParticipantMediaState(client);

    // Handle Agora client errors gracefully
    useEffect(() => {
        if (!client) return;

        const handleException = (event: { code: string; msg: string; uid?: string | number }) => {
            // Log in development, suppress in production
            if (process.env.NODE_ENV === 'development') {
                console.warn('Agora client exception (handled gracefully):', event);
            }

            // Handle specific error codes
            if (event.code === 'INVALID_REMOTE_USER') {
                // User left the channel while we were trying to subscribe
                // This is expected during rapid user join/leave scenarios
                return;
            }
        };

        client.on('exception', handleException);

        return () => {
            client.off('exception', handleException);
        };
    }, [client]);

    // Subscribe to remote user tracks when they publish (required for audience in live mode)
    useEffect(() => {
        if (!client) return;

        const handleUserPublished = async (user: any, mediaType: 'audio' | 'video') => {
            try {
                await client.subscribe(user, mediaType);
                console.log(`Viewer: Subscribed to ${mediaType} track from user ${user.uid}`);

                // Play audio tracks immediately (Enter Stream button provides user interaction)
                if (mediaType === 'audio' && user.audioTrack) {
                    await user.audioTrack.play();
                    console.log(`Viewer: Playing audio from user ${user.uid}`);
                }
            } catch (err) {
                console.warn(`Viewer: Failed to subscribe/play ${mediaType} from user ${user.uid}:`, err);
            }
        };

        client.on('user-published', handleUserPublished);

        return () => {
            client.off('user-published', handleUserPublished);
        };
    }, [client]);

    // Handle role switching - MUST complete before publishing in ILS mode
    useEffect(() => {
        if (client) {
            const targetRole = role === "publisher" ? "host" : "audience";
            setIsClientRoleSet(false); // Reset while changing
            client.setClientRole(targetRole)
                .then(() => {
                    console.log("Viewer: Client role set successfully to:", targetRole);
                    setIsClientRoleSet(true);
                })
                .catch(err => {
                    console.error("Failed to set client role:", err);
                    setIsClientRoleSet(false);
                });
        }
    }, [client, role]);

    // Join channel
    useJoin({
        appid: appId,
        channel: channelName,
        token: token,
        uid: uid,
    });

    // Sync RTM UID with actual RTC UID (Agora may assign a different UID after joining)
    // Priority: RTC-assigned UID > prop UID
    useEffect(() => {
        if (client && client.uid) {
            // Use the actual RTC UID that other participants see
            viewerRtmSingleton.currentUidRef.current = client.uid as number;
        } else {
            // Fallback to prop UID before RTC connection is established
            viewerRtmSingleton.currentUidRef.current = uid;
        }
    }, [client, client?.uid, uid]);

    // Publish tracks if role is publisher AND client role has been set
    // In ILS mode, you MUST be a "host" before publishing
    const canPublish = role === "publisher" && isClientRoleSet;
    usePublish([localCameraTrack, localMicrophoneTrack], canPublish);

    // Effect to enable/disable tracks based on state
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(isVideoEnabled);
        }
    }, [localCameraTrack, isVideoEnabled]);

    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(isAudioEnabled);
        }
    }, [localMicrophoneTrack, isAudioEnabled]);

    // --- Signaling (RTM) Implementation using Singleton ---
    const [isRTMReady, setIsRTMReady] = useState(false);
    // Map to store user details: uid -> { name, avatar, isRecording }
    const [userNames, setUserNames] = useState<Record<string, { name: string; avatar?: string; isRecording?: boolean }>>({});

    // Cleanup RTM singleton
    const cleanupViewerRTM = useCallback(() => {
        if (viewerRtmSingleton.instance) {
            console.log("RTM Viewer: Cleaning up singleton");
            viewerRtmSingleton.instance.logout();
            viewerRtmSingleton.instance = null;
            viewerRtmSingleton.channelName = null;
            viewerRtmSingleton.uid = null;
            viewerRtmSingleton.currentUidRef.current = null;
            viewerRtmSingleton.isInitializing = false;
        }
    }, []);

    // Handle leaving the stream - cleanup and call parent onLeave
    const handleLeaveStream = useCallback(async () => {
        console.log("Viewer: Leaving stream...");

        // Cleanup RTM
        cleanupViewerRTM();

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
    }, [cleanupViewerRTM, client, localCameraTrack, localMicrophoneTrack, role, onLeave]);

    // Message handler for RTM commands from host - uses ref to avoid stale closure
    const handleRTMMessage = useCallback((msg: SignalingMessage) => {
        console.log("RTM: Message received in viewer:", msg);

        const targetUid = msg.payload.userId.toString();
        // Use the ref to get the CURRENT uid, not a stale closure value
        const myUid = viewerRtmSingleton.currentUidRef.current?.toString() || '';

        if (msg.type === "MUTE_USER" && targetUid === myUid) {
            console.log("RTM: Command matched! Applying changes...");

            if (msg.payload.mediaType === "audio") {
                const newState = !msg.payload.mute;
                console.log("RTM: Setting audio to:", newState);
                setIsAudioEnabled(newState);

                toast.info(newState ? "The host has unmuted your microphone" : "The host has muted your microphone");
            }
            else if (msg.payload.mediaType === "video") {
                const newState = !msg.payload.mute;
                console.log("RTM: Setting video to:", newState);
                setIsVideoEnabled(newState);
                toast.info(newState ? "The host has enabled your camera" : "The host has disabled your camera");
            }
        }
        else if (msg.type === "KICK_USER" && targetUid === myUid) {
            console.log("RTM: Kick command received!");
            toast.error("You have been removed from the stream by the host.");
            handleLeaveStream();
        }
    }, [uid, handleLeaveStream]);

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

    useEffect(() => {
        if (!appId || !uid || !channelName || !rtmToken) {
            console.log("RTM Viewer: Missing required params");
            return;
        }

        // If singleton already exists for this channel and user, reuse it
        if (viewerRtmSingleton.instance && viewerRtmSingleton.channelName === channelName && viewerRtmSingleton.uid === uid) {
            console.log("RTM Viewer: Reusing existing singleton instance");
            // Re-attach callbacks to current instance (important for React state closures)
            viewerRtmSingleton.instance.onMessage(handleRTMMessage);
            viewerRtmSingleton.instance.onPresence(handleRTMPresence);

            // Announce self again to be sure
            if (userName) {
                viewerRtmSingleton.instance.setUserPresence(userName, userAvatar);
            }

            setIsRTMReady(true);
            return;
        }

        // If already initializing, just subscribe to updates
        if (viewerRtmSingleton.isInitializing) {
            console.log("RTM Viewer: Already initializing, subscribing to updates");
            const callback = (ready: boolean) => setIsRTMReady(ready);
            viewerRtmSingleton.subscribers.add(callback);
            return () => {
                viewerRtmSingleton.subscribers.delete(callback);
            };
        }

        // Start initialization
        viewerRtmSingleton.isInitializing = true;
        viewerRtmSingleton.channelName = channelName;
        viewerRtmSingleton.uid = uid;

        const initRTM = async () => {
            try {
                // Double-check no instance was created while we were waiting
                if (viewerRtmSingleton.instance) {
                    console.log("RTM Viewer: Instance already exists, skipping");
                    viewerRtmSingleton.instance.onMessage(handleRTMMessage);
                    viewerRtmSingleton.instance.onPresence(handleRTMPresence);
                    setIsRTMReady(true);
                    viewerRtmSingleton.isInitializing = false;
                    return;
                }

                console.log("RTM Viewer Init:", { channelName, uid, role });
                const sm = new SignalingManager(appId, uid, channelName);

                // Setup message listener FIRST
                sm.onMessage(handleRTMMessage);
                sm.onPresence(handleRTMPresence);

                await sm.login(rtmToken);

                console.log("RTM Viewer: Login successful, signaling ready");

                // Set initial presence if we have a name
                if (userName) {
                    await sm.setUserPresence(userName, userAvatar);
                }

                viewerRtmSingleton.instance = sm;
                viewerRtmSingleton.isInitializing = false;
                setIsRTMReady(true);

                // Notify all subscribers
                viewerRtmSingleton.subscribers.forEach(cb => cb(true));
            } catch (err: any) {
                console.warn("RTM Viewer: Login failed:", err?.message || err);
                viewerRtmSingleton.isInitializing = false;
                viewerRtmSingleton.subscribers.forEach(cb => cb(false));
            }
        };

        initRTM();

        // Don't cleanup on Strict Mode unmount - singleton persists
    }, [appId, uid, channelName, rtmToken, role, handleRTMMessage, handleRTMPresence, userName, userAvatar]);

    // Identify Host and other participants
    // If hostUid is provided, use it. Otherwise, assume the first remote user is the host.
    const hostUser = hostUid
        ? remoteUsers.find(u => u.uid === hostUid)
        : remoteUsers[0];

    const otherRemoteUsers = hostUid
        ? remoteUsers.filter(u => u.uid !== hostUid)
        : remoteUsers.slice(1);

    // Check if viewer is logged in
    const viewerIsLoggedIn = isViewerLoggedIn(session);
    // Ref for host video container for browser fullscreen
    const hostContainerRef = useRef<HTMLDivElement>(null);

    // Handle browser fullscreen for host
    const handleHostFullscreen = () => {
        if (hostContainerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                hostContainerRef.current.requestFullscreen();
            }
        }
    };

    // Prepare participants list for the grid
    // Only show other participants (non-host users) if the viewer is logged in
    const participants = [
        ...(role === "publisher" ? [{
            uid,
            name: userName || "You",
            videoTrack: localCameraTrack || undefined,
            audioTrack: localMicrophoneTrack || undefined,
            isLocal: true,
            cameraOn: isVideoEnabled,
            micOn: isAudioEnabled
        }] : []),

        ...(viewerIsLoggedIn ? otherRemoteUsers.map(user => {
            // Look up name in RTM map
            const odor = user.uid.toString();
            const rtmUser = userNames[odor];
            // Priority: RTM Name -> "User [ID]"
            const displayName = rtmUser?.name && rtmUser.name !== "undefined" ? rtmUser.name : `User ${user.uid}`;
            // Use reactive state from event listeners, falling back to SDK properties
            const mediaState = participantMediaState[odor];

            return {
                uid: user.uid,
                name: displayName,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                isLocal: false,
                cameraOn: mediaState?.hasVideo ?? user.hasVideo,
                micOn: mediaState?.hasAudio ?? user.hasAudio,
                agoraUser: user
            };
        }) : [])
    ];

    // --- Join / Login Logic ---
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleJoinRequest = () => {
        if (viewerIsLoggedIn) {
            onRequestUpgrade();
        } else {
            setShowLoginDialog(true);
        }
    };

    const handleLoginRedirect = () => {
        const currentUrl = window.location.href;
        const callbackUrl = encodeURIComponent(currentUrl);
        router.push(`/login?callbackUrl=${callbackUrl}`);
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

    const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);

    // Auto-show participants when user becomes a publisher (joins stream)
    useEffect(() => {
        if (role === "publisher") {
            setIsParticipantsVisible(true);
            setHasEnteredStream(true); // Publishers have already interacted
        }
    }, [role]);


    return (
        <div className="relative w-full h-[calc(100dvh-70px)] flex flex-col md:flex-row bg-background overflow-hidden shadow-2xl group/main">
            {/* Enter Stream Overlay - Captures user interaction for audio */}
            {!hasEnteredStream && role === "subscriber" && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md mx-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-foreground">Ready to Join?</h2>
                            <p className="text-muted-foreground">
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
            <div ref={hostContainerRef} className="flex-1 relative order-1 md:order-1 overflow-hidden bg-black flex items-center justify-center group/host">
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
                    {/* Host Live Badge */}
                    <div className="bg-destructive/90 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
                        <span className="font-bold text-[10px] md:text-xs tracking-wider uppercase mt-1">Live</span>
                    </div>



                    {/* Online User Count */}
                    <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                        <Users className="w-3 h-3 md:w-4 md:h-4 text-white/90" />
                        <span className="font-semibold text-[10px] md:text-xs tracking-wide mt-1">{remoteUsers.length + 1} online</span>
                    </div>
                </div>

                {/* Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Controls Overlay (Always Visible, Bottom Fixed) */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-background/60 backdrop-blur-md px-4 py-3 border-t border-white/10 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {role === "publisher" && (
                    <>
                        <Button
                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                            variant={isVideoEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="w-10 h-10 shadow-lg ring-1 ring-white/10"
                        >
                            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </Button>

                        <Button
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            variant={isAudioEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="w-10 h-10 shadow-lg ring-1 ring-white/10"
                        >
                            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        <div className="w-px h-6 bg-white/20 mx-2" />
                    </>
                )}

                {role === "subscriber" && (
                    <Button
                        onClick={handleJoinRequest}
                        variant="default"
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-xs md:text-sm"
                    >
                        <VideoIcon className="w-4 h-4" />
                        Join Stream
                    </Button>
                )}

                <Button
                    onClick={() => setIsParticipantsVisible(!isParticipantsVisible)}
                    variant={isParticipantsVisible ? "secondary" : "ghost"}
                    size="icon"
                    className={`w-10 h-10 shadow-lg hover:bg-accent hover:text-accent-foreground border ${!isParticipantsVisible ? "border-primary dark:border-transparent" : "border-transparent"}`}
                    title={isParticipantsVisible ? "Hide Participants" : "Show Participants"}
                >
                    <Users className="w-4 h-4 dark:text-white" />
                </Button>

                <div className="w-px h-6 bg-border mx-2" />

                <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Image src="/buck.svg" alt="Buck" width={60} height={18} className="object-contain w-10 h-10" />
                                Join Buck Today</AlertDialogTitle>
                            <AlertDialogDescription className="text-neutral-400">
                                Create an account or log in to join the stream with video and audio!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                            <AlertDialogCancel className="bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-300 mt-0">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleLoginRedirect}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                Log in / Sign up
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="w-10 h-10 shadow-lg hover:bg-destructive/80 transition-all shadow-destructive/20"
                        >
                            <PhoneOff className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Leave Stream</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to leave this stream?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveStream} className="bg-destructive hover:bg-destructive/90">
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
