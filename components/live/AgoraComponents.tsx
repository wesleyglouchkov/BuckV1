"use client";

import { useState, useRef, useEffect } from "react";
import { RemoteUser, IRemoteVideoTrack, IRemoteAudioTrack, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTCRemoteUser } from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, MoreHorizontal, X, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    onToggleRemoteMic?: (uid: string | number) => void;
    onToggleRemoteCamera?: (uid: string | number) => void;
    className?: string;
}

export function ParticipantTile({
    participant,
    isHost,
    onToggleRemoteMic,
    onToggleRemoteCamera,
    className
}: ParticipantTileProps) {
    const isCameraOn = participant.cameraOn ?? !!participant.videoTrack;
    const isMicOn = participant.micOn ?? !!participant.audioTrack;
    const videoRef = useRef<HTMLDivElement>(null);

    // Play local video track manually
    useEffect(() => {
        if (participant.isLocal && participant.videoTrack && videoRef.current) {
            const track = participant.videoTrack as ILocalVideoTrack;
            track.play(videoRef.current);
            return () => {
                track.stop();
            };
        }
    }, [participant.isLocal, participant.videoTrack]);

    return (
        <div className={cn(
            "relative aspect-video bg-neutral-900 overflow-hidden border border-white/10 group transition-all duration-300 hover:border-white/20 shadow-lg",
            className
        )}>
            {/* Video Rendering */}
            <div className="absolute inset-0 w-full h-full">
                {participant.isLocal ? (
                    <>
                        {isCameraOn && participant.videoTrack ? (
                            <div
                                ref={videoRef}
                                className="w-full h-full"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-800">
                                <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mb-2">
                                    <UserIcon className="w-8 h-8 text-neutral-400" />
                                </div>
                                <p className="text-xs text-neutral-500">Camera Off</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {participant.agoraUser && (
                            <RemoteUser
                                user={participant.agoraUser}
                                playVideo={isCameraOn}
                                playAudio={true}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {!isCameraOn && (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-800">
                                <div className="w-16 h-16 bg-neutral-700 flex items-center justify-center mb-2">
                                    <UserIcon className="w-8 h-8 text-neutral-400" />
                                </div>
                                <p className="text-xs text-neutral-500">Camera Off</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Status Indicators (Always visible) */}
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
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

            {/* Host Controls (Hover only) - Can only mute/disable, not unmute/enable */}
            {isHost && !participant.isLocal && (isMicOn || isCameraOn) && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
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

    const visibleParticipants = participants.slice(0, maxVisible);
    const hasMore = participants.length > maxVisible;
    const moreCount = participants.length - maxVisible;

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
                        {participants.map(p => (
                            <ParticipantTile
                                key={p.uid}
                                participant={p}
                                isHost={isHost}
                                onToggleRemoteMic={onToggleRemoteMic}
                                onToggleRemoteCamera={onToggleRemoteCamera}
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
                        onToggleRemoteMic={onToggleRemoteMic}
                        onToggleRemoteCamera={onToggleRemoteCamera}
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
