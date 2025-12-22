"use client";

import React, { useState, useRef, useEffect, useCallback, Component, ReactNode } from "react";
import { RemoteUser, IRemoteVideoTrack, IRemoteAudioTrack, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTCRemoteUser } from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, MoreHorizontal, X, User as UserIcon, Pin, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Error boundary to catch Agora subscription errors gracefully
interface RemoteUserErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error) => void;
}

interface RemoteUserErrorBoundaryState {
    hasError: boolean;
}

class RemoteUserErrorBoundary extends Component<RemoteUserErrorBoundaryProps, RemoteUserErrorBoundaryState> {
    constructor(props: RemoteUserErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): RemoteUserErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        // Only log in development, suppress in production
        if (process.env.NODE_ENV === 'development') {
            console.warn('RemoteUser subscription error (handled gracefully):', error.message);
        }
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

// Safe wrapper for RemoteUser that validates the user before rendering
interface SafeRemoteUserProps {
    user: IAgoraRTCRemoteUser;
    playVideo?: boolean;
    playAudio?: boolean;
    className?: string;
}

function SafeRemoteUser({ user, playVideo, playAudio, className }: SafeRemoteUserProps) {
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        // Check if user is still valid (has uid and is not undefined)
        if (!user || user.uid === undefined) {
            setIsValid(false);
            return;
        }
        setIsValid(true);
    }, [user]);

    if (!isValid || !user) {
        return null;
    }

    return (
        <RemoteUserErrorBoundary
            fallback={
                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                    <UserIcon className="w-8 h-8 text-neutral-500" />
                </div>
            }
        >
            <RemoteUser
                user={user}
                playVideo={playVideo}
                playAudio={playAudio}
                className={className}
            />
        </RemoteUserErrorBoundary>
    );
}

interface Participant {
    uid: string | number;
    name?: string;
    videoTrack?: IRemoteVideoTrack | ILocalVideoTrack;
    audioTrack?: IRemoteAudioTrack | ILocalAudioTrack;
    isLocal?: boolean;
    cameraOn?: boolean;
    micOn?: boolean;
    agoraUser?: IAgoraRTCRemoteUser;
}

interface ParticipantTileProps {
    participant: Participant;
    isHost?: boolean;
    pinnedUid?: string | number | null;
    onToggleRemoteMic?: (uid: string | number) => void;
    onToggleRemoteCamera?: (uid: string | number) => void;
    onPinUser?: (uid: string | number | null) => void;
    onFullscreen?: (uid: string | number) => void;
    className?: string;
}

export function ParticipantTile({
    participant,
    isHost,
    pinnedUid,
    onToggleRemoteMic,
    onToggleRemoteCamera,
    onPinUser,
    onFullscreen,
    className
}: ParticipantTileProps) {
    const isCameraOn = participant.cameraOn ?? !!participant.videoTrack;
    const isMicOn = participant.micOn ?? !!participant.audioTrack;
    const tileRef = useRef<HTMLDivElement>(null);
    const isPinned = pinnedUid?.toString() === participant.uid.toString();

    // Use callback ref to play video immediately when DOM element is mounted
    const videoRefCallback = useCallback((node: HTMLDivElement | null) => {
        if (node && participant.isLocal && participant.videoTrack && isCameraOn) {
            const track = participant.videoTrack as ILocalVideoTrack;
            track.play(node);
        }
    }, [participant.isLocal, participant.videoTrack, isCameraOn]);

    // Cleanup video track when camera is turned off
    useEffect(() => {
        if (!isCameraOn && participant.isLocal && participant.videoTrack) {
            const track = participant.videoTrack as ILocalVideoTrack;
            track.stop();
        }
    }, [isCameraOn, participant.isLocal, participant.videoTrack]);

    // Handle browser fullscreen
    const handleBrowserFullscreen = () => {
        if (tileRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                tileRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div
            ref={tileRef}
            className={cn(
                "relative aspect-video bg-neutral-800 overflow-hidden border border-primary group transition-all duration-300 hover:border-white/20 shadow-lg",
                isPinned && "z-30 scale-105 ring-2 ring-primary shadow-xl shadow-primary/20 ",
                className
            )}
        >
            {/* Video Rendering */}
            <div className="absolute inset-0 w-full h-full">
                {participant.isLocal ? (
                    <>
                        {isCameraOn && participant.videoTrack && (
                            <div
                                ref={videoRefCallback}
                                className="absolute inset-0 w-full h-full"
                            />
                        )}
                        {!isCameraOn && (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-900">
                                <div className="w-20 h-20 bg-neutral-700/50 rounded-full flex items-center justify-center mb-3 border border-neutral-600/30">
                                    <UserIcon className="w-10 h-10 text-neutral-400" />
                                </div>
                                <p className="text-sm text-neutral-400 font-medium">Camera Off</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {participant.agoraUser && (
                            <SafeRemoteUser
                                user={participant.agoraUser}
                                playVideo={isCameraOn}
                                playAudio={true}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {!isCameraOn && (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-900">
                                <div className="w-20 h-20 bg-neutral-700/50 rounded-full flex items-center justify-center mb-3 border border-neutral-600/30">
                                    <UserIcon className="w-10 h-10 text-neutral-400" />
                                </div>
                                <p className="text-sm text-neutral-400 font-medium">Camera Off</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Status Indicators (Always visible) */}
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                {isPinned && (
                    <div className="bg-primary/80 backdrop-blur-md p-1.5 border border-white/10 shadow-lg">
                        <Pin className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
                {!isMicOn && (
                    <div className="bg-destructive/80 backdrop-blur-md p-1.5 border border-white/10 shadow-lg">
                        <MicOff className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
                {!isCameraOn && (
                    <div className="bg-neutral-800/80 backdrop-blur-md p-1.5 border border-white/10 shadow-lg">
                        <VideoOff className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
            </div>

            {/* Name Overlay (Bottom Left) */}
            <div className="absolute bottom-3 left-3 z-10">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 border border-white/10 flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate max-w-[120px]">
                        {participant.name || (participant.isLocal ? "You" : `User ${participant.uid}`)}
                    </span>
                    {isMicOn && <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />}
                </div>
            </div>

            {/* Fullscreen Button (Bottom Right) - For non-host viewers */}
            {!isHost && (
                <div className="absolute top-2 right-10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-7 h-7 backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBrowserFullscreen();
                        }}
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}

            {/* Host Controls (Hover only) - Pin, mute, disable camera, AND fullscreen */}
            {isHost && !participant.isLocal && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                    {/* Pin Button */}
                    <Button
                        size="icon"
                        variant={isPinned ? "default" : "secondary"}
                        className={cn(
                            "w-10 h-10 backdrop-blur-md",
                            isPinned && "bg-primary hover:bg-primary/90"
                        )}
                        onClick={() => onPinUser?.(isPinned ? null : participant.uid)}
                        title={isPinned ? "Unpin User" : "Pin User"}
                    >
                        <Pin className="w-4 h-4" />
                    </Button>
                    {/* Mic Toggle - only shown when mic is ON (can only mute) */}
                    {isMicOn && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-10 h-10 backdrop-blur-md"
                            onClick={() => onToggleRemoteMic?.(participant.uid)}
                            title="Mute Participant"
                        >
                            <Mic className="w-4 h-4" />
                        </Button>
                    )}
                    {/* Camera Toggle - only shown when camera is ON (can only turn off) */}
                    {isCameraOn && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-10 h-10 backdrop-blur-md"
                            onClick={() => onToggleRemoteCamera?.(participant.uid)}
                            title="Disable Camera"
                        >
                            <Video className="w-4 h-4" />
                        </Button>
                    )}
                    {/* Fullscreen Button */}
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10 backdrop-blur-md"
                        onClick={handleBrowserFullscreen}
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

interface ParticipantGridProps {
    participants: Participant[];
    isHost?: boolean;
    maxVisible?: number;
    onToggleRemoteMic?: (uid: string | number) => void;
    onToggleRemoteCamera?: (uid: string | number) => void;
}

export function ParticipantGrid({
    participants,
    isHost,
    maxVisible = 5,
    onToggleRemoteMic,
    onToggleRemoteCamera
}: ParticipantGridProps) {
    const [showAll, setShowAll] = useState(false);
    const [pinnedUid, setPinnedUid] = useState<string | number | null>(null);

    // Reorder participants so pinned user is first
    const orderedParticipants = pinnedUid
        ? [
            ...participants.filter(p => p.uid.toString() === pinnedUid.toString()),
            ...participants.filter(p => p.uid.toString() !== pinnedUid.toString())
        ]
        : participants;

    const visibleParticipants = orderedParticipants.slice(0, maxVisible);
    const hasMore = orderedParticipants.length > maxVisible;
    const moreCount = orderedParticipants.length - maxVisible;

    // Handle pin - only one user can be pinned at a time
    const handlePinUser = (uid: string | number | null) => {
        setPinnedUid(uid);
    };

    if (showAll) {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-6 lg:p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">All Participants</h2>
                        <p className="text-neutral-400 text-sm">{participants.length} users in this stream</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 rounded-full w-12 h-12"
                        onClick={() => setShowAll(false)}
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                        {orderedParticipants.map(p => (
                            <ParticipantTile
                                key={p.uid}
                                participant={p}
                                isHost={isHost}
                                pinnedUid={pinnedUid}
                                onToggleRemoteMic={onToggleRemoteMic}
                                onToggleRemoteCamera={onToggleRemoteCamera}
                                onPinUser={handlePinUser}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className={cn(
                "grid gap-3 w-full",
                visibleParticipants.length === 1 ? "grid-cols-1" :
                    visibleParticipants.length === 2 ? "grid-cols-2" :
                        visibleParticipants.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
            )}>
                {visibleParticipants.map(p => (
                    <ParticipantTile
                        key={p.uid}
                        participant={p}
                        isHost={isHost}
                        pinnedUid={pinnedUid}
                        onToggleRemoteMic={onToggleRemoteMic}
                        onToggleRemoteCamera={onToggleRemoteCamera}
                        onPinUser={handlePinUser}
                    />
                ))}

                {hasMore && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="relative aspect-video rounded-xl bg-neutral-900/50 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800/50 hover:border-white/40 transition-all group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <MoreHorizontal className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium text-neutral-400 group-hover:text-white">
                            +{moreCount} More
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
