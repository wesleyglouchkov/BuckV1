"use client";

import { useRouter } from "next/navigation";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    useRTCClient,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Video as VideoIcon, Users, Maximize2 } from "lucide-react";
import { ParticipantGrid, ParticipantTile } from "./AgoraComponents";
import { toast } from "sonner";
import { SignalingManager } from "@/lib/agora-rtm";
import { Session } from "next-auth";
import { isViewerLoggedIn } from "@/lib/utils";

// Module-level singleton for RTM to prevent multiple instances in Strict Mode
const viewerRtmSingleton: {
    instance: SignalingManager | null;
    isInitializing: boolean;
    channelName: string | null;
    uid: number | null;
    currentUidRef: { current: number | null }; // Track current UID via ref for message handler
    subscribers: Set<(ready: boolean) => void>;
} = {
    instance: null,
    isInitializing: false,
    channelName: null,
    uid: null,
    currentUidRef: { current: null },
    subscribers: new Set(),
};

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
}: AgoraViewerProps) {
    const router = useRouter();

    // Track state - start enabled so tracks can be published
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Get remote users
    const remoteUsers = useRemoteUsers();

    // Local tracks - always create if role is publisher
    const { localCameraTrack } = useLocalCameraTrack(role === "publisher");
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(role === "publisher");

    const client = useRTCClient();

    // Track if client role has been set (needed before publishing in ILS mode)
    const [isClientRoleSet, setIsClientRoleSet] = useState(false);

    // Debug: Log role and track status
    useEffect(() => {
        console.log("Viewer Debug:", {
            role,
            hasLocalCameraTrack: !!localCameraTrack,
            hasLocalMicrophoneTrack: !!localMicrophoneTrack,
            isVideoEnabled,
            isAudioEnabled,
            clientUid: client?.uid,
            isClientRoleSet
        });
    }, [role, localCameraTrack, localMicrophoneTrack, isVideoEnabled, isAudioEnabled, client?.uid, isClientRoleSet]);

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

    // Message handler for RTM commands from host - uses ref to avoid stale closure
    const handleRTMMessage = useCallback((msg: { type: string; payload: { userId: string | number; mediaType: string; mute: boolean } }) => {
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

                toast.info(
                    newState
                        ? "The host has unmuted your microphone"
                        : "The host has muted your microphone"
                );
            } else if (msg.payload.mediaType === "video") {
                const newState = !msg.payload.mute;
                console.log("RTM: Setting video to:", newState);
                setIsVideoEnabled(newState);

                toast.info(
                    newState
                        ? "The host has enabled your camera"
                        : "The host has disabled your camera"
                );
            }
        }
    }, [uid]);

    useEffect(() => {
        if (!appId || !uid || !channelName || !rtmToken) {
            console.log("RTM Viewer: Missing required params");
            return;
        }

        // If singleton already exists for this channel and user, reuse it
        if (viewerRtmSingleton.instance &&
            viewerRtmSingleton.channelName === channelName &&
            viewerRtmSingleton.uid === uid) {
            console.log("RTM Viewer: Reusing existing singleton instance");
            viewerRtmSingleton.instance.onMessage(handleRTMMessage);
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
                    setIsRTMReady(true);
                    viewerRtmSingleton.isInitializing = false;
                    return;
                }

                console.log("RTM Viewer Init:", { channelName, uid, role });
                const sm = new SignalingManager(appId, uid, channelName);

                // Setup message listener FIRST
                sm.onMessage(handleRTMMessage);

                await sm.login(rtmToken);

                console.log("RTM Viewer: Login successful, signaling ready");
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
    }, [appId, uid, channelName, rtmToken, role, handleRTMMessage]);

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
            name: "You",
            videoTrack: localCameraTrack || undefined,
            audioTrack: localMicrophoneTrack || undefined,
            isLocal: true,
            cameraOn: isVideoEnabled,
            micOn: isAudioEnabled
        }] : []),

        ...(viewerIsLoggedIn ? otherRemoteUsers.map(user => ({
            uid: user.uid,
            name: `User ${user.uid}`,
            videoTrack: user.videoTrack,
            audioTrack: user.audioTrack,
            isLocal: false,
            cameraOn: user.hasVideo,
            micOn: user.hasAudio,
            agoraUser: user
        })) : [])
    ];

    return (
        <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden border border-white/5 shadow-2xl rounded-2xl group/main">
            {/* 1. HOST (Main Screen) */}
            <div ref={hostContainerRef} className="absolute inset-0 z-0 group/host">
                {hostUser ? (
                    <div className="w-full h-full relative">
                        <ParticipantTile
                            participant={{
                                uid: hostUser.uid,
                                name: "Host",
                                videoTrack: hostUser.videoTrack,
                                audioTrack: hostUser.audioTrack,
                                isLocal: false,
                                cameraOn: hostUser.hasVideo,
                                micOn: hostUser.hasAudio,
                                agoraUser: hostUser
                            }}
                            className="w-full h-full rounded-none border-none"
                        />
                        {/* Overlay to identify host clearly */}
                        <div className="absolute top-6 left-6 z-20">
                            <div className="bg-destructive/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="font-bold text-xs tracking-wider">HOST LIVE</span>
                            </div>
                        </div>

                        {/* Fullscreen Button for Host Video */}
                        <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover/host:opacity-100 transition-opacity duration-300">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="w-10 h-10 backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/10"
                                onClick={handleHostFullscreen}
                                title="Fullscreen"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                        </div>
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
            </div>

            {/* 2. PARTICIPANTS (Side Grid / Bottom Grid) */}
            <div className="absolute bottom-24 right-6 left-6 md:left-auto md:bottom-6 md:w-[30%] md:min-w-[200px] md:max-w-[400px] z-20 transition-all duration-300">
                <ParticipantGrid
                    participants={participants}
                    maxVisible={4}
                />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl z-30 opacity-0 group-hover/main:opacity-100 transition-all duration-300 translate-y-4 group-hover/main:translate-y-0">
                {role === "publisher" && (
                    <>
                        <Button
                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                            variant={isVideoEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="w-12 h-12 rounded-2xl shadow-lg ring-1 ring-white/10"
                        >
                            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>

                        <Button
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            variant={isAudioEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="w-12 h-12 rounded-2xl shadow-lg ring-1 ring-white/10"
                        >
                            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                    </>
                )}

                {role === "subscriber" && (
                    <Button
                        onClick={onRequestUpgrade}
                        variant="default"
                        className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <VideoIcon className="w-5 h-5" />
                        Join Stream
                    </Button>
                )}

                <Button
                    onClick={handleLeaveStream}
                    variant="destructive"
                    size="icon"
                    className="w-12 h-12 rounded-2xl shadow-lg hover:bg-destructive/80 transition-all shadow-destructive/20"
                >
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
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
