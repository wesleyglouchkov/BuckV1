"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import {
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useVolumeLevel,
    useRemoteUsers,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Users, Settings, Wifi, ArrowRightFromLine, ArrowLeftToLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParticipantGrid } from "./AgoraComponents";
import { toast } from "sonner";
import { SignalingManager } from "@/lib/agora/agora-rtm";
import { useViewerCount } from "@/hooks/useViewerCount";
import { globalRTMSingleton as rtmSingleton } from "@/lib/agora/rtm-singleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";



interface AgoraLiveStreamProps {
    appId: string;
    channelName: string;
    token: string;
    rtmToken: string; // Separate token for RTM signaling
    uid: number;
    streamId: string;
    isLive: boolean;
    onStreamEnd: (replayUrl?: string) => void;
    onStreamEndLoaderStart?: () => void;
    onRecordingReady?: (blob: Blob) => void;
    onPermissionChange?: (hasPermission: boolean) => void;
    isChatVisible?: boolean;
    setIsChatVisible?: (visible: boolean) => void;
    streamTitle?: string;
    streamType?: string;
    userName?: string;
    userAvatar?: string;
    initialRecordingDetails?: { resourceId: string; sid: string; uid: string } | null;
}

// Network quality indicator component
function NetworkIndicator({ quality }: { quality: number }) {
    const getColor = () => {
        if (quality <= 2) return "text-green-500";
        if (quality <= 4) return "text-yellow-500";
        return "text-red-500";
    };

    const getLabel = () => {
        if (quality <= 2) return "Excellent";
        if (quality <= 4) return "Good";
        if (quality <= 5) return "Poor";
        return "Bad";
    };

    return (
        <div className={cn("flex items-center gap-1.5 text-xs", getColor())}>
            <Wifi className="w-3 h-3" />
            <span>{getLabel()}</span>
        </div>
    );
}

// Audio level indicator
function AudioLevelIndicator({ level }: { level: number }) {
    const bars = 5;
    const activeBars = Math.ceil((level / 100) * bars);

    return (
        <div className="flex items-center gap-0.5 h-4">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-full transition-all duration-100",
                        i < activeBars ? "bg-green-500" : "bg-muted",
                        i === 0 ? "h-1" : i === 1 ? "h-2" : i === 2 ? "h-3" : i === 3 ? "h-4" : "h-5"
                    )}
                />
            ))}
        </div>
    );
}

// Component that joins and publishes when live
function LiveBroadcast({
    appId,
    channelName,
    token,
    rtmToken,
    uid,
    streamId,
    onStreamEnd,
    onStreamEndLoaderStart,
    onRecordingReady,
    isChatVisible,
    setIsChatVisible,
    streamTitle,
    streamType,
    userName,
    userAvatar,
    initialRecordingDetails
}: Omit<AgoraLiveStreamProps, "isLive">) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(!!initialRecordingDetails);
    const [recordingDetails, setRecordingDetails] = useState<{ resourceId: string, sid: string, uid: string } | null>(initialRecordingDetails || null);
    // User Names Map
    const [userNames, setUserNames] = useState<Record<string, { name: string; avatar?: string }>>({});
    const isStreamEndingRef = useRef(false);

    const client = useRTCClient();

    // Hooks for tracks - always create them initially
    const { localCameraTrack } = useLocalCameraTrack(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);

    // Remote users and audio level
    const remoteUsers = useRemoteUsers();
    // const audioLevel = useVolumeLevel(localMicrophoneTrack ?? undefined);

    // 1a. Effect to enable/disable camera track when toggle changes
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(isVideoEnabled);
        }
    }, [localCameraTrack, isVideoEnabled]);

    // 1b. Effect to enable/disable microphone track when toggle changes
    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(isAudioEnabled);
        }
    }, [localMicrophoneTrack, isAudioEnabled]);

    const [isHostJoined, setIsHostJoined] = useState(false);

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

    // 6. --- Cloud Recording Logic ---
    useEffect(() => {
        // Only start recording if we are live, host, and have tracks, and NOT currently ending the stream
        if (isHostJoined && localCameraTrack && localMicrophoneTrack && !isRecording && !isStreamEndingRef.current) {
            const startCloudRecording = async () => {
                try {
                    // Call Backend to start Agora Recorder
                    const res = await fetch(`/api/creator/streams/${streamId}/recording/start`, {
                        method: 'POST',
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setIsRecording(true);
                        setRecordingDetails({
                            resourceId: data.resourceId,
                            sid: data.sid,
                            uid: data.uid
                        });
                        toast.success("Cloud recording started");

                        // Store resourceId/sid in a ref if needed to stop later
                        // But usually we just call stop on the backend which looks up DB
                    } else {
                        console.error("Failed to start cloud recording", await res.text());
                        toast.error("Failed to start cloud recording");
                    }

                } catch (error) {
                    console.error("Failed to start cloud recording", error);
                    toast.error("Failed to start recording");
                }
            };
            startCloudRecording();
        }
    }, [isHostJoined, localCameraTrack, localMicrophoneTrack, isRecording, streamId]);


    // --- Signaling (RTM) Implementation using Singleton ---
    const [isRTMReady, setIsRTMReady] = useState(false);
    // Update RTM presence when recording state changes
    useEffect(() => {
        if (isRTMReady && rtmSingleton.instance && userName) {
            rtmSingleton.instance.setUserPresence(userName, userAvatar, isRecording);
        }
    }, [isRecording, isRTMReady, userName, userAvatar]);

    // Viewer count tracking
    const { viewerCount } = useViewerCount({
        streamId,
        rtmManager: rtmSingleton.instance,
        isHost: true,
        syncIntervalSeconds: 60,
    });

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

    useEffect(() => {
        if (!appId || !uid || !channelName || !rtmToken) {
            console.log("RTM: Missing required params");
            return;
        }

        // If singleton already exists for this channel, reuse it
        if (rtmSingleton.instance && rtmSingleton.channelName === channelName) {
            console.log("RTM: Reusing existing singleton instance");
            // Re-bind presence listener
            rtmSingleton.instance.onPresence(handleRTMPresence);

            // Announce self
            if (userName) {
                rtmSingleton.instance.setUserPresence(userName, userAvatar);
            }

            setIsRTMReady(true);
            return;
        }

        // If already initializing, just subscribe to updates
        if (rtmSingleton.isInitializing) {
            console.log("RTM: Already initializing, subscribing to updates");
            const callback = (ready: boolean) => setIsRTMReady(ready);
            rtmSingleton.subscribers.add(callback);
            return () => {
                rtmSingleton.subscribers.delete(callback);
            };
        }

        // Start initialization
        rtmSingleton.isInitializing = true;
        rtmSingleton.channelName = channelName;

        const initRTM = async () => {
            try {
                // Double-check no instance was created while we were waiting
                if (rtmSingleton.instance) {
                    console.log("RTM: Instance already exists, skipping");
                    setIsRTMReady(true);
                    rtmSingleton.isInitializing = false;
                    return;
                }

                const sm = new SignalingManager(appId, uid, channelName);
                console.log("RTM: SignalingManager created (singleton)");

                sm.onPresence(handleRTMPresence);

                await sm.login(rtmToken);

                console.log("RTM: Login successful, signaling ready");

                if (userName) {
                    await sm.setUserPresence(userName, userAvatar);
                }

                rtmSingleton.instance = sm;
                rtmSingleton.isInitializing = false;
                setIsRTMReady(true);

                // Notify all subscribers
                rtmSingleton.subscribers.forEach(cb => cb(true));
            } catch (err: any) {
                console.warn("RTM: Login failed:", err?.message || err);
                rtmSingleton.isInitializing = false;
                rtmSingleton.subscribers.forEach(cb => cb(false));
            }
        };

        initRTM();

        // Don't cleanup on Strict Mode unmount - singleton persists
    }, [appId, uid, channelName, rtmToken, userName, userAvatar, handleRTMPresence]);

    // Cleanup singleton only when stream actually ends
    const cleanupRTM = useCallback(() => {
        if (rtmSingleton.instance) {
            console.log("RTM: Cleaning up singleton");
            rtmSingleton.instance.logout();
            rtmSingleton.instance = null;
            rtmSingleton.channelName = null;
            rtmSingleton.isInitializing = false;
        }
    }, []);

    const handleToggleRemoteMic = async (remoteUid: string | number) => {
        if (!isRTMReady || !rtmSingleton.instance) {
            console.error("RTM: Signaling not ready", { isRTMReady, hasInstance: !!rtmSingleton.instance });
            toast.error("Signaling still connecting. Please wait a moment and try again.");
            return;
        }

        // Check connection status
        if (!rtmSingleton.instance.isConnected()) {
            console.error("RTM: Not connected to signaling");
            toast.error("Not connected to signaling service. Reconnecting...");
            return;
        }

        // Find current state from participants list
        const participant = participants.find(p => p.uid.toString() === remoteUid.toString());
        const isCurrentlyOn = participant?.micOn ?? true;

        console.log("RTM: Toggling remote mic", {
            remoteUid,
            currentState: isCurrentlyOn,
            willMute: isCurrentlyOn
        });

        try {
            const message = {
                type: "MUTE_USER" as const,
                payload: {
                    userId: remoteUid,
                    mediaType: "audio" as const,
                    mute: isCurrentlyOn // If it's on, we want to mute (mute=true)
                }
            };

            await rtmSingleton.instance.sendMessage(message);

            toast.success(
                `${isCurrentlyOn ? 'Mute' : 'Unmute'} command sent to User ${remoteUid}`,
                {
                    description: "The user should see the change shortly"
                }
            );

            console.log("RTM: Command sent successfully");
        } catch (err) {
            console.error("RTM: Failed to send mute command:", err);
            toast.error("Failed to send mute command", {
                description: "Please check your connection and try again"
            });
        }
    };

    const handleToggleRemoteCamera = async (remoteUid: string | number) => {
        if (!isRTMReady || !rtmSingleton.instance) {
            console.error("RTM: Signaling not ready", { isRTMReady, hasInstance: !!rtmSingleton.instance });
            toast.error("Signaling still connecting. Please wait a moment and try again.");
            return;
        }

        if (!rtmSingleton.instance.isConnected()) {
            console.error("RTM: Not connected to signaling");
            toast.error("Not connected to signaling service. Reconnecting...");
            return;
        }

        // Find current state
        const participant = participants.find(p => p.uid.toString() === remoteUid.toString());
        const isCurrentlyOn = participant?.cameraOn ?? true;

        try {
            const message = {
                type: "MUTE_USER" as const,
                payload: {
                    userId: remoteUid,
                    mediaType: "video" as const,
                    mute: isCurrentlyOn
                }
            };

            await rtmSingleton.instance.sendMessage(message);

            toast.success(
                `${isCurrentlyOn ? 'Disable' : 'Enable'} camera command sent to User ${remoteUid}`,
                {
                    description: "The user should see the change shortly"
                }
            );
        } catch (err) {
            console.error("RTM: Failed to send camera command:", err);
            toast.error("Failed to send camera command", {
                description: "Please check your connection and try again"
            });
        }
    };

    const handleRemoveRemoteUser = async (remoteUid: string | number) => {
        if (!isRTMReady || !rtmSingleton.instance) {
            console.error("RTM: Signaling not ready", { isRTMReady, hasInstance: !!rtmSingleton.instance });
            toast.error("Signaling still connecting. Please wait a moment and try again.");
            return;
        }

        if (!rtmSingleton.instance.isConnected()) {
            console.error("RTM: Not connected to signaling");
            toast.error("Not connected to signaling service. Reconnecting...");
            return;
        }

        try {
            const message = {
                type: "KICK_USER" as const,
                payload: {
                    userId: remoteUid,
                    mediaType: "all" as const, // Placeholder
                    mute: true // Placeholder
                }
            };

            await rtmSingleton.instance.sendMessage(message);

            toast.success(`Removed User ${remoteUid} from the stream`, { description: "User will be disconnected shortly" });
        } catch (err) {
            console.error("RTM: Failed to send kick command:", err);
            toast.error("Failed to remove user", { description: "Please check your connection and try again" });
        }
    };

    const endStream = async () => {
        isStreamEndingRef.current = true;
        onStreamEndLoaderStart?.();
        let recordingKey = undefined;
        // Stop Cloud Recording via Backend
        if (isRecording && recordingDetails) {
            try {
                toast.loading("Stopping recording and saving...");
                const res = await fetch(`/api/creator/streams/${streamId}/recording/stop`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resourceId: recordingDetails.resourceId,
                        sid: recordingDetails.sid,
                        uid: recordingDetails.uid
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.recordingKey) {
                        recordingKey = data.recordingKey;
                    }
                }
            } catch (e) { console.error("Error stopping recording:", e) }
        }
        setIsRecording(false);
        try {
            await client.leave();
        } catch (e) { console.error("Error leaving channel:", e); }

        localCameraTrack?.close();
        localMicrophoneTrack?.close();
        cleanupRTM();
        onStreamEnd(recordingKey);
    };

    // Prepare participants list
    const participants = [
        {
            uid,
            name: "You (Host)", // Creator already knows they are host
            videoTrack: localCameraTrack || undefined,
            audioTrack: localMicrophoneTrack || undefined,
            isLocal: true,
            cameraOn: isVideoEnabled,
            micOn: isAudioEnabled
        },
        ...remoteUsers.map(user => {
            return {
                uid: user.uid,
                name: userNames[user.uid.toString()]?.name || `User ${user.uid}`,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                isLocal: false,
                cameraOn: user.hasVideo,
                micOn: user.hasAudio,
                agoraUser: user
            };
        })
    ];


    return (
        <div className="relative w-full h-[85vh] dark:bg-neutral-950 overflow-hidden shadow-2xl group/main">
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
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-background/90 backdrop-blur-sm px-4 py-2 border-t border-white/10 z-30 transition-all duration-300">
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
                <div className="flex items-center gap-1">
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
                            >
                                <PhoneOff className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>End Stream</AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400">
                                    Are you sure you want to end this stream? All participants will be disconnected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-300">Cancel</AlertDialogCancel>
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

// Preview component - uses native browser API, no Agora
function PreviewMode({ onPermissionChange }: { onPermissionChange?: (hasPermission: boolean) => void }) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null); // Use ref for cleanup
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Initialize camera/mic preview
    useEffect(() => {
        let isMounted = true;

        const startPreview = async () => {
            try {
                setPermissionError(null);
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: isVideoEnabled,
                    audio: isAudioEnabled,
                });

                if (!isMounted) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = mediaStream;
                onPermissionChange?.(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Setup audio level monitoring
                if (isAudioEnabled && mediaStream.getAudioTracks().length > 0) {
                    audioContextRef.current = new AudioContext();
                    const source = audioContextRef.current.createMediaStreamSource(mediaStream);
                    analyserRef.current = audioContextRef.current.createAnalyser();
                    analyserRef.current.fftSize = 256;
                    source.connect(analyserRef.current);

                    const checkLevel = () => {
                        if (!analyserRef.current || !isMounted) return;
                        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                        analyserRef.current.getByteFrequencyData(dataArray);
                        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                        setAudioLevel(avg / 255);
                        if (isMounted) requestAnimationFrame(checkLevel);
                    };
                    checkLevel();
                }
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                        setPermissionError("Camera and microphone access is required to go live. Please allow access in your browser settings.");
                    } else if (err.name === "NotFoundError") {
                        setPermissionError("No camera or microphone found. Please connect a device and try again.");
                    } else if (err.name === "NotReadableError") {
                        setPermissionError("Your camera or microphone is already in use by another application.");
                    } else {
                        setPermissionError("Unable to access camera/microphone. Please check your device settings.");
                    }
                    onPermissionChange?.(false);
                    console.warn("Media access error:", err.name, err.message);
                }
            }
        };

        startPreview();

        // Cleanup on unmount - ALWAYS stop all tracks
        return () => {
            isMounted = false;
            // Stop all tracks in the stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }
            // Close audio context
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [isVideoEnabled, isAudioEnabled, onPermissionChange]);

    // Permission error UI
    if (permissionError) {
        return (
            <div className="relative w-full aspect-video bg-card overflow-hidden border border-border shadow-lg">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <VideoOff className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Permission Required</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                        {permissionError}
                    </p>
                    <Button
                        onClick={() => {
                            setPermissionError(null);
                            // Re-trigger permission request
                            setIsVideoEnabled(prev => !prev);
                            setTimeout(() => setIsVideoEnabled(true), 100);
                        }}
                        variant="outline"
                    >
                        Try Again
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        Click the camera icon in your browser&apos;s address bar to manage permissions
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[85vh] bg-card overflow-hidden border border-border shadow-lg">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
            />

            {/* Placeholder when video disabled */}
            {!isVideoEnabled && (
                <div className="absolute inset-0 bg-card flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                        <VideoOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    Preview Mode
                </div>

                {isAudioEnabled && (
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <AudioLevelIndicator level={audioLevel * 100} />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/60 p-6 z-20">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        variant={isVideoEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="w-14 h-14 rounded-full"
                    >
                        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        variant={isAudioEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="w-14 h-14 rounded-full"
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main wrapper - only use AgoraRTCProvider when live AND token is available
export default function AgoraLiveStream(props: AgoraLiveStreamProps) {
    // Memoize the client to prevent reconnection on parent re-renders
    const client = useMemo(() => {
        if (!props.isLive || !props.token) return null;
        return AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }, [props.isLive, props.token]);

    // For preview, we don't need Agora at all
    if (!props.isLive) {
        return <PreviewMode onPermissionChange={props.onPermissionChange} />;
    }

    // Wait for token before joining Agora channel
    if (!props.token || !client) {
        return (
            <div className="relative w-full h-[85vh] bg-card overflow-hidden border border-border shadow-lg">
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
                isChatVisible={props.isChatVisible}
                setIsChatVisible={props.setIsChatVisible}
                streamTitle={props.streamTitle}
                streamType={props.streamType}
                userName={props.userName}
                userAvatar={props.userAvatar}
                initialRecordingDetails={props.initialRecordingDetails}
            />
        </AgoraRTCProvider>
    );
}
