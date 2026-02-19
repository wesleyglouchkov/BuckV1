"use client";

import { Button } from "@/components/ui/button";
import { Radio, AlertTriangle, Video, Mic, Users } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VideoDeviceControl, AudioDeviceControl } from "./StreamControls";
import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";

interface StreamPreviewOverlayProps {
    isLive: boolean;
    hasPermission: boolean | null;
    isGoingLive: boolean;
    canGoLive: boolean;
    streamTitle: string;
    streamType: string;
    onGoLive: () => void;
    onGrantPermissions: () => void;
    // New props for controls
    cameraTrack?: ICameraVideoTrack | null;
    micTrack?: IMicrophoneAudioTrack | null;
    isVideoEnabled?: boolean;
    isAudioEnabled?: boolean;
    onToggleVideo?: () => void;
    onToggleAudio?: () => void;
}

export default function StreamPreviewOverlay({
    isLive,
    hasPermission,
    isGoingLive,
    canGoLive,
    streamTitle,
    streamType,
    onGoLive,
    onGrantPermissions,
    cameraTrack,
    micTrack,
    isVideoEnabled = true,
    isAudioEnabled = true,
    onToggleVideo,
    onToggleAudio,
}: StreamPreviewOverlayProps) {
    return (
        <div className="absolute inset-0 bg-background/1 backdrop-blur-xs flex items-center justify-center z-20">
            {/* Logo - Top Left */}
            <Image
                src='/buck.svg'
                alt='go live'
                width={40}
                height={40}
                className="absolute top-4 left-4"
            />
            {/* Status Badge - Top Right */}
            <div
                className={cn(
                    "absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium",
                    isLive
                        ? "bg-destructive text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                )}
            >
                <span
                    className={cn(
                        "w-2 h-2",
                        isLive ? "bg-white animate-pulse" : "bg-white/70"
                    )}
                />
                {isLive ? "LIVE" : "Preview"}
            </div>

            <div className="text-center space-y-6 p-8">
                <div className={cn(
                    "sm:w-20 sm:h-20 sm:flex hidden items-center justify-center mx-auto",
                    hasPermission === false ? "bg-yellow-500/20" : "bg-destructive/20"
                )}>
                    {hasPermission === false ? (
                        <AlertTriangle className="w-10 h-10 text-yellow-500" />
                    ) : (
                        <Radio className="sm:w-10 sm:h-10 text-destructive w-4 h-4" />
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 hidden sm:block">
                        {hasPermission === false ? "Permission Required" : "Ready to go live?"}
                    </h2>
                    <p className="text-white/70 sm:block hidden">
                        {hasPermission === false
                            ? "Please allow camera and microphone access"
                            : hasPermission === true
                                ? "Check your settings and go live"
                                : "Checking camera and microphone..."
                        }
                    </p>
                </div>

                <div className="flex flex-col gap-3 items-center">
                    {(!streamTitle.trim() || !streamType.trim()) ? (
                        <div className="text-white dark:text-gray-400 text-sm font-black bg-black/20 px-4 py-2 backdrop-blur-md">
                            To go live, fill in the title and select the stream type.
                        </div>
                    ) : (
                        <Button
                            onClick={onGoLive}
                            disabled={isGoingLive || !canGoLive}
                            size="lg"
                            className="bg-destructive hover:bg-destructive/90 text-white px-6 py-4 text-base shadow-lg disabled:opacity-50 w-auto"
                        >
                            <Radio className="w-5 h-5 mr-2" />
                            {isGoingLive ? "Starting..." : "Go Live"}
                        </Button>
                    )}

                    {hasPermission === false && (
                        <Button
                            onClick={onGrantPermissions}
                            variant="outline"
                            size="lg"
                            className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg"
                        >
                            Grant Permissions
                        </Button>
                    )}
                </div>

                {/* Device Controls replacing Status Indicators */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    {hasPermission !== false && onToggleVideo && onToggleAudio && (
                        <div className="flex items-center gap-4 bg-black/20 p-2 backdrop-blur-md">
                            <VideoDeviceControl
                                isVideoEnabled={isVideoEnabled}
                                onToggle={onToggleVideo}
                                currentCameraTrack={cameraTrack || null}
                                disableToggle={true}
                            />
                            <div className="w-px h-8 bg-white/10" />
                            <AudioDeviceControl
                                isAudioEnabled={isAudioEnabled}
                                onToggle={onToggleAudio}
                                currentMicTrack={micTrack || null}
                                disableToggle={true}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span className="font-bold">Followers and Subscribers will be notified via email</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
