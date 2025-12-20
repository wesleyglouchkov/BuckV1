"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import {
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useIsConnected,
    useNetworkQuality,
    useVolumeLevel,
    LocalUser,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgoraLiveStreamProps {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
    streamId: string;
    isLive: boolean;
    onStreamEnd: (replayUrl?: string) => void;
    onRecordingReady?: (blob: Blob) => void;
    onPermissionChange?: (hasPermission: boolean) => void;
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
    uid,
    onStreamEnd,
    onRecordingReady,
}: Omit<AgoraLiveStreamProps, "isLive" | "streamId">) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const client = useRTCClient();

    // Hooks for tracks - always create them initially
    const { localCameraTrack } = useLocalCameraTrack(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);

    // Connection & quality hooks
    const isConnected = useIsConnected();
    // const networkQuality = useNetworkQuality();
    const audioLevel = useVolumeLevel(localMicrophoneTrack ?? undefined);

    // Effect to enable/disable camera track when toggle changes
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(isVideoEnabled);
        }
    }, [localCameraTrack, isVideoEnabled]);

    // Effect to enable/disable microphone track when toggle changes
    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(isAudioEnabled);
        }
    }, [localMicrophoneTrack, isAudioEnabled]);

    useJoin({
        appid: appId,
        channel: channelName,
        token: token || null, // Use null if no token provided
        uid
    });

    // Publish tracks
    usePublish([localCameraTrack, localMicrophoneTrack]);

    // Start recording
    const startRecording = useCallback(() => {
        if (!localCameraTrack || !localMicrophoneTrack || isRecording) return;

        try {
            const videoTrack = localCameraTrack.getMediaStreamTrack();
            const audioTrack = localMicrophoneTrack.getMediaStreamTrack();
            const stream = new MediaStream([videoTrack, audioTrack]);

            const recorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp8,opus",
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                onRecordingReady?.(blob);
            };

            recorder.start(1000);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (err) {
            console.error("Recording failed:", err);
        }
    }, [localCameraTrack, localMicrophoneTrack, isRecording, onRecordingReady]);

    // Auto-start recording when tracks ready
    useEffect(() => {
        if (localCameraTrack && localMicrophoneTrack && !isRecording) {
            startRecording();
        }
    }, [localCameraTrack, localMicrophoneTrack, isRecording, startRecording]);

    const endStream = async () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        await client.leave();
        localCameraTrack?.close();
        localMicrophoneTrack?.close();
        onStreamEnd();
    };

    return (
        <div className="relative w-full aspect-video bg-card overflow-hidden border border-border shadow-lg">
            <LocalUser
                audioTrack={localMicrophoneTrack}
                videoTrack={localCameraTrack}
                cameraOn={isVideoEnabled}
                micOn={isAudioEnabled}
                playAudio={false}
                playVideo={isVideoEnabled}
                className="w-full h-full"
            />

            {/* Placeholder when video is off */}
            {!isVideoEnabled && (
                <div className="absolute flex flex-col items-center justify-center inset-0 bg-card z-10">
                    <div className="w-24 h-24 flex-col rounded-full bg-muted flex gap-4 items-center justify-center">
                        <VideoOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                        Your video is not enabled, press on the video button to enable it.
                    </p>
                </div>
            )}

            {/* Top Bar with Status */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    {/* Live Badge */}
                    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="font-semibold text-sm">LIVE</span>
                    </div>

                    {/* Connection Status
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                        {isConnected ? (
                            <NetworkIndicator quality={networkQuality.uplinkNetworkQuality} />
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-yellow-500">
                                <WifiOff className="w-3 h-3" />
                                <span>Connecting...</span>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* Recording + Audio Level */}
                <div className="flex items-center gap-3">
                    {isAudioEnabled && (
                        <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <AudioLevelIndicator level={audioLevel * 100} />
                        </div>
                    )}

                    {isRecording && (
                        <div className="bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <p className="mt-1">REC</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-6 z-20">
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

                    <Button onClick={endStream} variant="destructive" size="icon" className="w-14 h-14 rounded-full">
                        <PhoneOff className="w-6 h-6" />
                    </Button>
                </div>
            </div>
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
        <div className="relative w-full aspect-video bg-card overflow-hidden border border-border shadow-lg">
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
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-6 z-20">
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
            <div className="relative w-full aspect-video bg-card overflow-hidden border border-border shadow-lg">
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
                uid={props.uid}
                onStreamEnd={props.onStreamEnd}
                onRecordingReady={props.onRecordingReady}
            />
        </AgoraRTCProvider>
    );
}
