import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";
import StreamPreviewOverlay from "./StreamPreviewOverlay";
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

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
                        "w-1 transition-all duration-100",
                        i < activeBars ? "bg-green-500" : "bg-muted",
                        i === 0 ? "h-1" : i === 1 ? "h-2" : i === 2 ? "h-3" : i === 3 ? "h-4" : "h-5"
                    )}
                />
            ))}
        </div>
    );
}

export function StreamPreviewMode({
    onPermissionChange,
    isLive,
    hasPermission,
    isGoingLive,
    canGoLive,
    streamTitle,
    streamType,
    onGoLive,
    onGrantPermissions
}: {
    onPermissionChange?: (hasPermission: boolean) => void;
    isLive: boolean;
    hasPermission: boolean | null;
    isGoingLive: boolean;
    canGoLive: boolean;
    streamTitle: string;
    streamType: string;
    onGoLive: () => void;
    onGrantPermissions: () => void;
}) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    // Agora Tracks
    const [cameraTrack, setCameraTrack] = useState<ICameraVideoTrack | null>(null);
    const [micTrack, setMicTrack] = useState<IMicrophoneAudioTrack | null>(null);

    const videoRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Initialize camera/mic preview using Agora Tracks
    useEffect(() => {
        let isMounted = true;

        const startPreview = async (useSavedDevices = true) => {
            try {
                setPermissionError(null);

                // Get stored device IDs
                const savedCameraId = useSavedDevices ? localStorage.getItem("buck-camera-id") : null;
                const savedMicId = useSavedDevices ? localStorage.getItem("buck-mic-id") : null;

                // Create Agora Tracks
                let videoTrack: ICameraVideoTrack;
                let audioTrack: IMicrophoneAudioTrack;

                try {
                    const tracks = await Promise.all([
                        AgoraRTC.createCameraVideoTrack({
                            cameraId: savedCameraId || undefined,
                            encoderConfig: "720p_1"
                        }).catch(err => {
                            if (useSavedDevices && savedCameraId) throw err;
                            return AgoraRTC.createCameraVideoTrack({ encoderConfig: "720p_1" });
                        }),
                        AgoraRTC.createMicrophoneAudioTrack({
                            microphoneId: savedMicId || undefined
                        }).catch(err => {
                            if (useSavedDevices && savedMicId) throw err;
                            return AgoraRTC.createMicrophoneAudioTrack();
                        })
                    ]);
                    videoTrack = tracks[0] as ICameraVideoTrack;
                    audioTrack = tracks[1] as IMicrophoneAudioTrack;
                } catch (err) {
                    if (useSavedDevices && (savedCameraId || savedMicId)) {
                        console.warn("Saved devices failed, retrying with defaults...");
                        localStorage.removeItem("buck-camera-id");
                        localStorage.removeItem("buck-mic-id");
                        return startPreview(false);
                    }
                    throw err;
                }

                if (!isMounted) {
                    videoTrack.close();
                    audioTrack.close();
                    return;
                }

                setCameraTrack(videoTrack);
                setMicTrack(audioTrack);
                onPermissionChange?.(true);

                // Play video track
                if (videoRef.current) {
                    videoTrack.play(videoRef.current);
                }

                // Setup audio level monitoring
                if (audioTrack) {
                    // Extract native MediaStreamTrack for Web Audio API
                    const mediaStreamTrack = audioTrack.getMediaStreamTrack();
                    const mediaStream = new MediaStream([mediaStreamTrack]);

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
            } catch (err: any) {
                if (err instanceof Error || (err && err.name)) {
                    const errorName = err.name || (err as any).code;
                    console.error("Media access error:", errorName, err.message);

                    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
                        setPermissionError("Camera and microphone access is required to go live. \nPlease allow access in your browser settings.");
                    } else if (errorName === "NotFoundError" || errorName === "DEVICE_NOT_FOUND") {
                        setPermissionError("No camera or microphone found. Please connect a device and try again.");
                    } else if (errorName === "NotReadableError" || errorName === "TRACK_IS_OCCUPIED") {
                        setPermissionError("Your camera or microphone is already in use by another application.");
                    } else {
                        setPermissionError(`Unable to access camera/microphone (${errorName}). Please check your device settings and ensure no other app is using them.`);
                    }
                    onPermissionChange?.(false);
                } else {
                    setPermissionError("An unexpected error occurred while accessing your camera/microphone.");
                    console.error("Unknown media access error:", err);
                    onPermissionChange?.(false);
                }
            }
        };

        startPreview();

        // Cleanup
        return () => {
            isMounted = false;
            // Tracks are closed in separate cleanup/dependencies or when component unmounts
            // We need to access the LATEST tracks to close them
            if (cameraTrack) {
                cameraTrack.stop();
                cameraTrack.close();
            }
            if (micTrack) {
                micTrack.stop();
                micTrack.close();
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // Handle Toggles
    useEffect(() => {
        if (cameraTrack) cameraTrack.setEnabled(isVideoEnabled);
    }, [isVideoEnabled, cameraTrack]);

    useEffect(() => {
        if (micTrack) micTrack.setEnabled(isAudioEnabled);
    }, [isAudioEnabled, micTrack]);


    // Ensure tracks are cleaned up when unmounting (switching to live)
    useEffect(() => {
        return () => {
            cameraTrack?.close();
            micTrack?.close();
        };
    }, [cameraTrack, micTrack]);

    // Permission error UI
    if (permissionError) {
        return (
            <div className="relative w-full aspect-video bg-card overflow-hidden border border-border shadow-lg">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-destructive/10 flex items-center justify-center mb-4">
                        <VideoOff className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Permission Required</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6 whitespace-pre-line">
                        {permissionError}
                    </p>
                    <Button
                        onClick={() => {
                            setPermissionError(null);
                            // Force reload/retry logic could go here, or just let user manually retry via browser
                            window.location.reload();
                        }}
                        variant="outline"
                    >
                        Reload Page
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        Click the camera icon in your browser&apos;s address bar to manage permissions
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[calc(100dvh-70px)] bg-card overflow-hidden border border-border shadow-lg group">
            {/* Play video on this div */}
            <div
                ref={videoRef}
                className="w-full h-full object-cover -scale-x-100"
                id="preview-player"
            />

            {/* Placeholder when video disabled */}
            {!isVideoEnabled && (
                <div className="absolute inset-0 bg-card flex items-center justify-center z-10">
                    <div className="w-24 h-24 bg-muted flex items-center justify-center">
                        <VideoOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="bg-secondary/90 text-secondary-foreground px-4 py-2 text-sm font-medium">
                    Preview Mode
                </div>

                {isAudioEnabled && (
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5">
                        <AudioLevelIndicator level={audioLevel * 100} />
                    </div>
                )}
            </div>

            {/* OVERLAY with Controls */}
            <StreamPreviewOverlay
                isLive={isLive}
                hasPermission={hasPermission}
                isGoingLive={isGoingLive}
                canGoLive={canGoLive}
                streamTitle={streamTitle}
                streamType={streamType}
                onGoLive={onGoLive}
                onGrantPermissions={onGrantPermissions}
                // Pass tracks for device selection
                cameraTrack={cameraTrack}
                micTrack={micTrack}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
                onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
            />
        </div>
    );
}
