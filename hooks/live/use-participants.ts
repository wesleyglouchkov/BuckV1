"use client";

import { useMemo } from "react";
// Using 'any' for Agora types to avoid conflicts between sdk-ng and react-wrapper types
// in the consuming components.

export interface StreamParticipant {
    uid: number | string;
    name: string;
    avatar?: string;
    videoTrack?: any;
    audioTrack?: any;
    isLocal: boolean;
    cameraOn: boolean;
    micOn: boolean;
    agoraUser?: any;
}

interface UseParticipantsProps {
    uid: number;
    userName?: string;
    localCameraTrack: any;
    localMicrophoneTrack: any;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    remoteUsers: any[];
    userNames: Record<string, { name: string; avatar?: string; isRecording?: boolean }>;
    participantMediaState: Record<string, { hasVideo?: boolean; hasAudio?: boolean }>;
    kickedUsers?: Set<string>;
    includeLocal?: boolean;
}

/**
 * Hook to compute the list of participants (local + remote) with mapped names and media state.
 */
export function useParticipants({
    uid,
    userName,
    localCameraTrack,
    localMicrophoneTrack,
    isVideoEnabled,
    isAudioEnabled,
    remoteUsers,
    userNames,
    participantMediaState,
    kickedUsers = new Set(),
    includeLocal = true
}: UseParticipantsProps) {

    return useMemo(() => {
        const list: StreamParticipant[] = [];

        // Local User
        if (includeLocal) {
            list.push({
                uid,
                name: userName || "You",
                videoTrack: localCameraTrack || undefined,
                audioTrack: localMicrophoneTrack || undefined,
                isLocal: true,
                cameraOn: isVideoEnabled,
                micOn: isAudioEnabled,
                agoraUser: undefined
            });
        }

        // Remote Users
        const remoteParticipants = remoteUsers
            .filter((user: any) => !kickedUsers.has(user.uid.toString()))
            .map((user: any) => {
                const uidStr = user.uid.toString();
                const rtmUser = userNames[uidStr];
                const displayName = rtmUser?.name && rtmUser.name !== "undefined" ? rtmUser.name : `User ${user.uid}`;
                const mediaState = participantMediaState[uidStr];

                return {
                    uid: user.uid,
                    name: displayName,
                    avatar: rtmUser?.avatar,
                    videoTrack: user.videoTrack,
                    audioTrack: user.audioTrack,
                    isLocal: false,
                    cameraOn: mediaState?.hasVideo ?? user.hasVideo,
                    micOn: mediaState?.hasAudio ?? user.hasAudio,
                    agoraUser: user
                };
            });

        return [...list, ...remoteParticipants];
    }, [uid, userName, localCameraTrack, localMicrophoneTrack, isVideoEnabled, isAudioEnabled, remoteUsers, userNames, participantMediaState, kickedUsers, includeLocal]);
}
