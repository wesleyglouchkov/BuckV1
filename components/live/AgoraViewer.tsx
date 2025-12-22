"use client";

import { useState, useMemo, useEffect } from "react";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    useRTCClient,
    LocalUser,
    RemoteUser,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Video as VideoIcon, Users, Maximize2 } from "lucide-react";
import { ParticipantGrid, ParticipantTile } from "./AgoraComponents";
import { toast } from "sonner";
import { SignalingManager } from "@/lib/agora-rtm";
import { useRef } from "react";
import { Session } from "next-auth";
import { isViewerLoggedIn } from "@/lib/utils";

export interface AgoraViewerProps {
    appId: string;
    channelName: string;
    token: string;
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
    uid,
    role,
    hostUid,
    session,
    onLeave,
    onRequestUpgrade,
}: AgoraViewerProps) {
    // Track state
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    // Get remote users
    const remoteUsers = useRemoteUsers();

    // Local tracks - only initialized if role is publisher AND enabled
    const { localCameraTrack } = useLocalCameraTrack(role === "publisher" && isVideoEnabled);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(role === "publisher" && isAudioEnabled);

    const client = useRTCClient();

    // Handle role switching
    useEffect(() => {
        if (client) {
            const targetRole = role === "publisher" ? "host" : "audience";
            client.setClientRole(targetRole)
                .catch(err => console.error("Failed to set client role:", err));
        }
    }, [client, role]);

    // Join channel
    useJoin({
        appid: appId,
        channel: channelName,
        token: token,
        uid: uid,
    });

    // Publish tracks if role is publisher
    usePublish([localCameraTrack, localMicrophoneTrack], role === "publisher");

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

    // --- Signaling (RTM) Implementation ---
    const signalingRef = useRef<SignalingManager | null>(null);
    const hasInitializedRTM = useRef(false);

    useEffect(() => {
        if (!appId || !uid || !channelName || !token) return;
        if (hasInitializedRTM.current) return; // Prevent duplicate initialization

        hasInitializedRTM.current = true;

        // Small delay to let React stabilize and prevent "login too frequent"
        const timeoutId = setTimeout(() => {
            console.log("RTM Viewer Init:", { channelName, uid }); // DEBUG
            const sm = new SignalingManager(appId, uid, channelName);
            signalingRef.current = sm;

            sm.login(token).then(() => {
                // Listen for host commands
                sm.onMessage((msg) => {
                    if (msg.type === "MUTE_USER" && msg.payload.userId.toString() === uid.toString()) {
                        if (msg.payload.mediaType === "audio") {
                            setIsAudioEnabled(!msg.payload.mute);
                            toast.info("The host has muted your microphone");
                        } else if (msg.payload.mediaType === "video") {
                            setIsVideoEnabled(!msg.payload.mute);
                            toast.info("The host has disabled your camera");
                        }
                    }
                });
            }).catch(err => {
                console.warn("Signaling login failed - remote controls may not work:", err);
                hasInitializedRTM.current = false; // Allow retry on error
            });
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            if (signalingRef.current) {
                signalingRef.current.logout();
            }
        };
    }, [appId, uid, channelName, token]);

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
            <div className="absolute inset-0 z-0">
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
                    onClick={onLeave}
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
