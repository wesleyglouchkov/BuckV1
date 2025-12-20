"use client";

import { useState, useMemo, useEffect } from "react";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    LocalUser,
    RemoteUser,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Video as VideoIcon } from "lucide-react";

export interface AgoraViewerProps {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
    role: "publisher" | "subscriber";
    onLeave: () => void;
    onRequestUpgrade: () => void;
}

function StreamLogic({
    appId,
    channelName,
    token,
    uid,
    role,
    onLeave,
    onRequestUpgrade,
}: AgoraViewerProps) {
    // Track state
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Get remote users (The Host should be one of them)
    // Note: If this component is used by the Host, they won't see themselves as a remote user.
    // But per requirements, this is for "non creator (members)".
    const remoteUsers = useRemoteUsers();

    // Local tracks - only initialized if role is publisher
    // We pass 'role === "publisher"' to hooks to conditionally create tracks, 
    // BUT Agora hooks don't support conditional execution easily. 
    // Best practice: Always call hooks, but control enablement/publishing.
    const { localCameraTrack } = useLocalCameraTrack(role === "publisher");
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(role === "publisher");

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

    return (
        <div className="relative w-full aspect-video bg-black overflow-hidden border border-border shadow-lg group">
            {/* View Area - Logic depends on what we want to see */}

            {/* 1. If we are a publisher (Member with Cam), we usually want to see the HOST primarily, 
               and ourselves in a small PIP (Picture-in-Picture) or side-by-side. 
               For simplicity in this step, let's render the HOST full screen, and ourselves floating.
            */}

            {/* Render Remote Users (The Host) */}
            {remoteUsers.map((user) => (
                <div key={user.uid} className="absolute inset-0 w-full h-full z-0">
                    <RemoteUser user={user} className="w-full h-full object-cover" />
                    {/* Optional: Label for Host */}
                    <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        Host
                    </div>
                </div>
            ))}

            {/* Fallback if no host is live/visible yet */}
            {remoteUsers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-0">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p>Waiting for host...</p>
                    </div>
                </div>
            )}

            {/* Self View (PIP) - Only if Publisher */}
            {role === "publisher" && (
                <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden border border-white/20 shadow-xl z-20">
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        videoTrack={localCameraTrack}
                        cameraOn={isVideoEnabled}
                        micOn={isAudioEnabled}
                        playAudio={false} // Don't play own audio loopback
                        playVideo={isVideoEnabled}
                        className="w-full h-full"
                    />
                    {/* Local Mute Indicators for PIP */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        {!isAudioEnabled && <div className="bg-red-500/80 p-1 rounded-full"><MicOff className="w-3 h-3 text-white" /></div>}
                        {!isVideoEnabled && <div className="bg-red-500/80 p-1 rounded-full"><VideoOff className="w-3 h-3 text-white" /></div>}
                    </div>
                </div>
            )}


            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-30 transition-opacity opacity-0 group-hover:opacity-100">
                <div className="flex items-center justify-center gap-4">
                    {/* Only show Cam/Mic controls if Publisher */}
                    {role === "publisher" && (
                        <>
                            <Button
                                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                variant={isVideoEnabled ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full"
                            >
                                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>

                            <Button
                                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                variant={isAudioEnabled ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full"
                            >
                                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                        </>
                    )}

                    {/* Join with Video Button - Only if Subscriber */}
                    {role === "subscriber" && (
                        <Button
                            onClick={onRequestUpgrade}
                            variant="default"
                            className="bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
                        >
                            <VideoIcon className="w-5 h-5" />
                            Join with Camera
                        </Button>
                    )}


                    {/* Leave Button */}
                    <Button
                        onClick={onLeave}
                        variant="destructive"
                        size="icon"
                        className="rounded-full ml-4"
                        title="Leave Stream"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </Button>
                </div>
            </div>
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
