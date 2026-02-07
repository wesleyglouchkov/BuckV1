"use client";

import { toast } from "sonner";
import { type SignalingManager } from "@/lib/agora/agora-rtm";
import { useState, useCallback } from "react";
import { streamService } from "@/services/stream";

// Lookup function type for getting participant media state
export type MediaStateLookup = (uid: string | number) => { micOn?: boolean; cameraOn?: boolean } | undefined;

interface UseRemoteControlsProps {
    isRTMReady: boolean;
    rtmInstance: SignalingManager | null;
    getMediaState: MediaStateLookup;
    streamId: string;
}

export function useRemoteControls({ isRTMReady, rtmInstance, getMediaState, streamId }: UseRemoteControlsProps) {
    const [kickedUsers, setKickedUsers] = useState<Set<string>>(new Set());

    const handleToggleRemoteMic = useCallback(async (remoteUid: string | number) => {
        if (!isRTMReady || !rtmInstance) {
            console.error("RTM: Signaling not ready");
            toast.error("Signaling still connecting. Please wait a moment and try again.");
            return;
        }

        if (!rtmInstance.isConnected()) {
            console.error("RTM: Not connected to signaling");
            toast.error("Not connected to signaling service. Reconnecting...");
            return;
        }

        const mediaState = getMediaState(remoteUid);
        const isCurrentlyOn = mediaState?.micOn ?? true;

        try {
            await rtmInstance.sendMessage({
                type: "MUTE_USER",
                payload: {
                    userId: remoteUid,
                    mediaType: "audio",
                    mute: isCurrentlyOn // Toggle: if on, mute (true)
                }
            });

            toast.success(
                `${isCurrentlyOn ? 'Mute' : 'Unmute'} command sent to User ${remoteUid}`,
                { description: "The user should see the change shortly" }
            );
        } catch (err) {
            console.error("RTM: Failed to send mute command:", err);
            toast.error("Failed to send mute command");
        }
    }, [isRTMReady, rtmInstance, getMediaState]);

    const handleToggleRemoteCamera = useCallback(async (remoteUid: string | number) => {
        if (!isRTMReady || !rtmInstance) {
            toast.error("Signaling still connecting...");
            return;
        }

        if (!rtmInstance.isConnected()) {
            toast.error("Not connected to signaling service.");
            return;
        }

        const mediaState = getMediaState(remoteUid);
        const isCurrentlyOn = mediaState?.cameraOn ?? true;

        try {
            await rtmInstance.sendMessage({
                type: "MUTE_USER",
                payload: {
                    userId: remoteUid,
                    mediaType: "video",
                    mute: isCurrentlyOn
                }
            });

            toast.success(
                `${isCurrentlyOn ? 'Disable' : 'Enable'} camera command sent to User ${remoteUid}`,
                { description: "The user should see the change shortly" }
            );
        } catch (err) {
            console.error("RTM: Failed to send camera command:", err);
            toast.error("Failed to send camera command");
        }
    }, [isRTMReady, rtmInstance, getMediaState]);

    const handleRemoveRemoteUser = useCallback(async (remoteUid: string | number) => {
        const rtmConnected = isRTMReady && rtmInstance && rtmInstance.isConnected();

        if (rtmConnected) {
            try {
                await rtmInstance!.sendMessage({
                    type: "KICK_USER",
                    payload: {
                        userId: remoteUid,
                        mediaType: "all",
                        mute: true
                    }
                });
                // no need to call leaveParticipation as it already handle by user-left event
            } catch (err) {
                console.warn("RTM: Failed to send kick command:", err);
            }
        }

        setKickedUsers(prev => new Set(prev).add(remoteUid.toString()));

        if (rtmConnected) {
            toast.success(`Removed User ${remoteUid} from the stream`);
        } else {
            toast.success(`Removed User ${remoteUid} from your view`);
        }
    }, [isRTMReady, rtmInstance]);

    return {
        kickedUsers,
        handleToggleRemoteMic,
        handleToggleRemoteCamera,
        handleRemoveRemoteUser
    };
}
