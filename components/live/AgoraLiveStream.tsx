"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import { useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Users, ArrowRightFromLine, ArrowLeftToLine } from "lucide-react";
import { ParticipantGrid } from "./AgoraComponents";
import { globalRTMSingleton as rtmSingleton } from "@/lib/agora/rtm-singleton";
import { useViewerCount } from "@/hooks/useViewerCount";
import { useParticipantMediaState } from "@/hooks/use-participant-media-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useStreamControlsTour } from "@/hooks/use-onboarding-tours";
import { StreamPreviewMode } from "./StreamPreviewMode";
import { useTrackToggle } from "@/hooks/live/use-track-toggle";
import { useRTMClient } from "@/hooks/live/use-rtm-client";
import { useParticipants } from "@/hooks/live/use-participants";
import { useRemoteControls } from "@/hooks/live/use-remote-controls";



interface AgoraLiveStreamProps {
    appId: string;
    channelName: string;
    token: string;
    rtmToken: string; // Separate token for RTM signaling
    uid: number;
    streamId: string;
    isLive: boolean;
    onStreamEnd: () => void;
    onStreamEndLoaderStart?: () => void;
    onRecordingReady?: (blob: Blob) => void;
    onPermissionChange?: (hasPermission: boolean) => void;
    onRTMReady?: (isReady: boolean) => void; // Callback when RTM is ready
    isChatVisible?: boolean;
    setIsChatVisible?: (visible: boolean) => void;
    streamTitle?: string;
    streamType?: string;
    userName?: string;
    userAvatar?: string;
    isRecording: boolean;
    setIsRecording: (isRecording: boolean) => void;
    recordingDetails: { resourceId: string; sid: string; uid: string } | null;
    setRecordingDetails: (details: { resourceId: string; sid: string; uid: string } | null) => void;
}



// Component that joins and publishes when live
function LiveBroadcast({ appId, channelName, token, rtmToken, uid, streamId, onStreamEnd, onStreamEndLoaderStart, onRecordingReady, onRTMReady, isChatVisible, setIsChatVisible, streamTitle, streamType, userName, userAvatar, isRecording, setIsRecording, recordingDetails, setRecordingDetails }: Omit<AgoraLiveStreamProps, "isLive">) {
    // ========== STATE ==========
    const [userNames, setUserNames] = useState<Record<string, { name: string; avatar?: string }>>({});
    const [isHostJoined, setIsHostJoined] = useState(false);

    // ========== REFS ==========
    const isStreamEndingRef = useRef(false);

    // ========== AGORA HOOKS ==========
    const client = useRTCClient();
    const remoteUsers = useRemoteUsers();
    const { localCameraTrack } = useLocalCameraTrack(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
    const participantMediaState = useParticipantMediaState(client);
    const { isVideoEnabled, setIsVideoEnabled, isAudioEnabled, setIsAudioEnabled } = useTrackToggle(localCameraTrack, localMicrophoneTrack);

    // ========== TOUR ==========
    const { startTour } = useStreamControlsTour({ isHost: true, hasJoined: isHostJoined });

    // Trigger tour when host joins stream
    useEffect(() => {
        if (isHostJoined) {
            // Small delay to ensure controls are rendered
            const timer = setTimeout(() => {
                startTour();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isHostJoined, startTour]);

    // 2. Ensure client role is set to host for the creator BEFORE joining
    useEffect(() => {
        if (client) {
            client.setClientRole("host")
                .then(() => setIsHostJoined(true))
                .catch(err => console.error("Failed to set client role to host:", err));
        }
    }, [client]);

    // 3. Join channel only when role is host
    useJoin({
        appid: appId,
        channel: channelName,
        token: token || null,
        uid
    }, isHostJoined);

    // 4. Publish tracks only when role is host
    usePublish([localCameraTrack, localMicrophoneTrack], isHostJoined);

    // 5. Handle Agora client errors gracefully
    useEffect(() => {
        if (!client) return;

        const handleException = (event: { code: string; msg: string; uid?: string | number }) => {
            // Log in development, suppress in production
            if (process.env.NODE_ENV === 'development') {
                console.warn('Agora client exception (handled gracefully):', event);
            }

            // Handle specific error codes
            if (event.code === 'INVALID_REMOTE_USER') {
                return;
            }
        };

        client.on('exception', handleException);

        return () => {
            client.off('exception', handleException);
        };
    }, [client]);

    // RTM Presence Handler
    const handleRTMPresence = useCallback((p: { userId: string, name?: string, avatar?: string, isOnline: boolean }) => {
        if (p.isOnline) {
            setUserNames(prev => {
                const existing = prev[p.userId];
                // Use new name if present, otherwise keep existing, otherwise fallback to default
                const displayName = p.name || existing?.name || `User ${p.userId}`;
                const displayAvatar = p.avatar || existing?.avatar;

                // Avoid unnecessary state updates
                if (existing?.name === displayName && existing?.avatar === displayAvatar) {
                    return prev;
                }

                return {
                    ...prev,
                    [p.userId]: { name: displayName, avatar: displayAvatar }
                };
            });
        }
    }, []);

    // --- Signaling (RTM) Implementation using Hook ---
    const { isRTMReady, cleanupRTM } = useRTMClient({
        appId,
        channelName,
        uid,
        rtmToken,
        userName,
        userAvatar,
        role: 'host',
        onPresence: handleRTMPresence
    });

    // Notify parent when RTM is ready
    useEffect(() => {
        onRTMReady?.(isRTMReady);
    }, [isRTMReady, onRTMReady]);

    // Update RTM presence when recording state changes
    useEffect(() => {
        if (isRTMReady && rtmSingleton.instance && userName) {
            rtmSingleton.instance.setUserPresence(userName, userAvatar, isRecording);
        }
    }, [isRecording, isRTMReady, userName, userAvatar]);

    // Viewer count tracking
    const { viewerCount } = useViewerCount({
        streamId,
        rtmManager: isRTMReady ? rtmSingleton.instance : null,
        isHost: true,
        syncIntervalSeconds: 60,
    });

    // Remote controls (Mute/Kick) - uses lookup function for media state
    const getMediaState = useCallback((uid: string | number) => {
        const uidStr = uid.toString();
        const state = participantMediaState[uidStr];
        const remoteUser = remoteUsers.find(u => u.uid.toString() === uidStr);
        return {
            micOn: state?.hasAudio ?? remoteUser?.hasAudio ?? true,
            cameraOn: state?.hasVideo ?? remoteUser?.hasVideo ?? true
        };
    }, [participantMediaState, remoteUsers]);

    const { kickedUsers, handleToggleRemoteMic, handleToggleRemoteCamera, handleRemoveRemoteUser } = useRemoteControls({
        isRTMReady,
        rtmInstance: rtmSingleton.instance,
        getMediaState
    });

    // Single participants list with kicked users filtered
    const participants = useParticipants({
        uid,
        userName: "You (Host)",
        localCameraTrack,
        localMicrophoneTrack,
        isVideoEnabled,
        isAudioEnabled,
        remoteUsers,
        userNames,
        participantMediaState,
        kickedUsers
    });

    const endStream = async () => {
        isStreamEndingRef.current = true;
        onStreamEndLoaderStart?.();

        // Leave the Agora channel
        try {
            await client.leave();
        } catch (e) { console.error("Error leaving channel:", e); }

        // Cleanup local tracks
        localCameraTrack?.close();
        localMicrophoneTrack?.close();
        cleanupRTM();

        // Signal parent to handle recording stop and stream end
        onStreamEnd();
    };


    return (
        <div className="relative w-full h-[calc(100dvh-70px)] dark:bg-neutral-950 overflow-hidden shadow-2xl group/main">
            {/* Main Participant Grid */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl max-h-full overflow-y-auto custom-scrollbar flex items-center justify-center">
                    <ParticipantGrid
                        participants={participants}
                        isHost={true}
                        maxVisible={6}
                        onToggleRemoteMic={handleToggleRemoteMic}
                        onToggleRemoteCamera={handleToggleRemoteCamera}
                        onRemoveRemoteUser={handleRemoveRemoteUser}
                        onCloseChat={() => setIsChatVisible?.(false)}
                    />
                </div>
            </div>

            {/* Top Bar with Status - Premium Visuals */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Live Badge */}
                    <div className="bg-destructive/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        <span className="mt-1 font-bold text-xs tracking-wider">Live</span>
                    </div>

                    {/* Viewer Count */}
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                        <Users className="w-3.5 h-3.5 text-white" />
                        <span className="mt-1 text-white text-xs font-semibold">{viewerCount} online</span>
                    </div>
                </div>


            </div>

            {/* Bottom Bar - Unified Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-background/90 backdrop-blur-sm px-4 py-2 border-t border-white/10 z-30 transition-all duration-300" data-tour="stream-controls">
                {/* Left: REC Indicator */}
                <div className="flex-1 flex justify-start">
                    {isRecording && (
                        <div className="bg-destructive text-white px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold rounded-sm">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span className="mt-1">REC</span>
                        </div>
                    )}
                </div>

                {/* Center: Main Controls */}
                <div className="flex items-center gap-1" data-tour="media-controls">
                    <Button
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        variant={isVideoEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="w-9 h-9 shadow-lg ring-1 ring-white/10"
                    >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>

                    <Button
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        variant={isAudioEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="w-9 h-9 shadow-lg ring-1 ring-white/10"
                    >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-9 h-9 shadow-lg hover:bg-destructive/80 transition-all shadow-destructive/20"
                                data-tour="end-stream-btn"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border-border text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-black dark:text-white">End Stream</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-white text-gray-500">
                                    Are you sure you want to end this stream? All participants will be disconnected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent  dark:text-white border-neutral-700 text-black">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={endStream} className="bg-destructive hover:bg-destructive/90">
                                    End Stream
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Right: Chat Toggle */}
                <div className="flex-1 flex justify-end">
                    <Button
                        variant="default"
                        size="sm"
                        className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            setIsChatVisible?.(!isChatVisible);
                        }}
                        data-tour="chat-toggle"
                    >
                        {isChatVisible ? <ArrowRightFromLine className="w-4 h-4" /> : <ArrowLeftToLine className="w-4 h-4" />}
                        <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider">{isChatVisible ? "Hide Chat" : "Chat"}</span>
                    </Button>
                </div>
            </div>

            {/* Background Grain/Texture for Premium Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}



// Main wrapper - only use AgoraRTCProvider when live
export default function AgoraLiveStream(props: AgoraLiveStreamProps) {
    // Memoize the client - CRITICAL: Don't recreate on token changes ,  Recreating the client destroys all internal state and listeners.
    const client = useMemo(() => {
        if (!props.isLive) return null;
        console.log("Agora: Creating new RTC client");
        return AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }, [props.isLive]); // Only recreate if live status changes

    // For preview, we don't need Agora at all
    if (!props.isLive) {
        return <StreamPreviewMode onPermissionChange={props.onPermissionChange} />;
    }

    // Wait for token before joining Agora channel
    if (!props.token || !client) {
        return (
            <div className="relative w-full h-[calc(100dvh-70px)] bg-card overflow-hidden border border-border shadow-lg">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground text-sm">Connecting to stream...</p>
                </div>
            </div>
        );
    }

    return (
        <AgoraRTCProvider client={client}>
            <LiveBroadcast
                appId={props.appId}
                channelName={props.channelName}
                token={props.token}
                rtmToken={props.rtmToken}
                uid={props.uid}
                streamId={props.streamId}
                onStreamEnd={props.onStreamEnd}
                onStreamEndLoaderStart={props.onStreamEndLoaderStart}
                onRecordingReady={props.onRecordingReady}
                onRTMReady={props.onRTMReady}
                isChatVisible={props.isChatVisible}
                setIsChatVisible={props.setIsChatVisible}
                streamTitle={props.streamTitle}
                streamType={props.streamType}
                userName={props.userName}
                userAvatar={props.userAvatar}
                recordingDetails={props.recordingDetails}
                setRecordingDetails={props.setRecordingDetails}
                isRecording={props.isRecording}
                setIsRecording={props.setIsRecording}
            />
        </AgoraRTCProvider>
    );
}
