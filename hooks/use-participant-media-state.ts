"use client";

import { useState, useEffect } from "react";
import { IAgoraRTCClient } from "agora-rtc-react";

export interface ParticipantMediaState {
    hasVideo: boolean;
    hasAudio: boolean;
}

/**
 * Custom hook to track participant media states reactively via Agora events.
 * Listens to user-published, user-unpublished, and user-left events to maintain
 * an accurate record of each remote user's camera/mic status.
 * 
 * @param client - The Agora RTC client instance
 * @returns A record mapping user IDs to their media state
 */
export function useParticipantMediaState(client: IAgoraRTCClient | null) {
    const [participantMediaState, setParticipantMediaState] = useState<Record<string, ParticipantMediaState>>({});

    useEffect(() => {
        if (!client) return;

        const handleUserPublished = async (user: any, mediaType: 'audio' | 'video') => {
            const odor = user.uid.toString();
            console.log(`[useParticipantMediaState] user-published: ${odor} ${mediaType}`);

            try {
                // Subscribe if not already subscribed
                // In some cases, useRemoteUsers might have already triggered a subscription
                await client.subscribe(user, mediaType);
                console.log(`[useParticipantMediaState] Subscribed to ${odor}'s ${mediaType}`);

                // Play audio tracks immediately
                if (mediaType === 'audio' && user.audioTrack) {
                    user.audioTrack.setVolume(100);
                    await user.audioTrack.play();
                    console.log(`[useParticipantMediaState] Playing audio from user ${odor}`);
                }
            } catch (error: any) {
                // Ignore "ALREADY_SUBSCRIBED" errors
                if (error.code !== 'ALREADY_SUBSCRIBED') {
                    console.warn(`[useParticipantMediaState] Failed to subscribe to ${odor}'s ${mediaType}:`, error);
                }
            }

            setParticipantMediaState(prev => ({
                ...prev,
                [odor]: {
                    hasVideo: mediaType === 'video' ? true : (prev[odor]?.hasVideo ?? user.hasVideo ?? false),
                    hasAudio: mediaType === 'audio' ? true : (prev[odor]?.hasAudio ?? user.hasAudio ?? false)
                }
            }));
        };

        const handleUserUnpublished = (user: any, mediaType: 'audio' | 'video') => {
            const odor = user.uid.toString();
            console.log(`[useParticipantMediaState] user-unpublished: ${odor} ${mediaType}`);
            setParticipantMediaState(prev => ({
                ...prev,
                [odor]: {
                    hasVideo: mediaType === 'video' ? false : (prev[odor]?.hasVideo ?? false),
                    hasAudio: mediaType === 'audio' ? false : (prev[odor]?.hasAudio ?? false)
                }
            }));
        };

        const handleUserLeft = (user: any) => {
            const odor = user.uid.toString();
            console.log(`[useParticipantMediaState] user-left: ${odor}`);
            setParticipantMediaState(prev => {
                const newState = { ...prev };
                delete newState[odor];
                return newState;
            });
        };

        // Initialize with existing remote users
        if (client.remoteUsers.length > 0) {
            console.log(`[useParticipantMediaState] Initializing with ${client.remoteUsers.length} existing users`);
            client.remoteUsers.forEach(user => {
                const odor = user.uid.toString();
                setParticipantMediaState(prev => ({
                    ...prev,
                    [odor]: {
                        hasVideo: user.hasVideo,
                        hasAudio: user.hasAudio
                    }
                }));

                // Try to subscribe to existing tracks if they are already published
                if (user.hasVideo) handleUserPublished(user, 'video');
                if (user.hasAudio) handleUserPublished(user, 'audio');
            });
        }

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);

        return () => {
            client.off('user-published', handleUserPublished);
            client.off('user-unpublished', handleUserUnpublished);
            client.off('user-left', handleUserLeft);
        };

    }, [client]);

    return participantMediaState;
}
