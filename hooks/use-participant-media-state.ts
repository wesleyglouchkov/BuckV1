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
            try {
                // Subscribe to the remote user's track to receive the media
                await client.subscribe(user, mediaType);
                console.log(`Subscribed to ${user.uid}'s ${mediaType}`);
            } catch (error) {
                console.warn(`Failed to subscribe to ${user.uid}'s ${mediaType}:`, error);
            }

            const odor = user.uid.toString();
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
            setParticipantMediaState(prev => {
                const newState = { ...prev };
                delete newState[odor];
                return newState;
            });
        };

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
