"use client";

import { Button } from "@/components/ui/button";
import { Radio, AlertTriangle, Video, Mic, Users } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface StreamPreviewOverlayProps {
    isLive: boolean;
    hasPermission: boolean | null;
    isGoingLive: boolean;
    canGoLive: boolean;
    streamTitle: string;
    streamType: string;
    onGoLive: () => void;
    onGrantPermissions: () => void;
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
                    "absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                    isLive
                        ? "bg-destructive text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                )}
            >
                <span
                    className={cn(
                        "w-2 h-2 rounded-full",
                        isLive ? "bg-white animate-pulse" : "bg-white/70"
                    )}
                />
                {isLive ? "LIVE" : "Preview"}
            </div>

            <div className="text-center space-y-6 p-8">
                <div className={cn(
                    "sm:w-20 sm:h-20 sm:flex hidden rounded-full items-center justify-center mx-auto",
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
                                ? "Your camera and microphone are ready"
                                : "Checking camera and microphone..."
                        }
                    </p>
                </div>

                <div className="flex flex-col gap-3 items-center">
                    {(!streamTitle.trim() || !streamType.trim()) ? (
                        <div className="text-gray-400 text-sm font-black bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                            To go live, fill in the title and select the stream type.
                        </div>
                    ) : (
                        <Button
                            onClick={onGoLive}
                            disabled={isGoingLive || !canGoLive}
                            size="lg"
                            className="bg-destructive hover:bg-destructive/90 text-white px-6 py-4 text-base rounded-full shadow-lg disabled:opacity-50 w-auto"
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
                            className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                        >
                            Grant Permissions
                        </Button>
                    )}
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Video className={cn(
                            "w-4 h-4",
                            hasPermission === false ? "text-red-400" : "text-green-400"
                        )} />
                        <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Camera blocked" : "Camera ready"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Mic className={cn(
                            "w-4 h-4",
                            hasPermission === false ? "text-red-400" : "text-green-400"
                        )} />
                        <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Mic blocked" : "Mic ready"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="mt-1 max-sm:text-xs">Followers and Subscribers will be notified via email</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
