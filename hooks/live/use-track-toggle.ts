"use client";

import { useState, useEffect } from "react";

/**
 * Hook to handle local track toggling (camera and microphone).
 * Using 'any' for tracks to avoid type conflicts between agora-rtc-sdk-ng and agora-rtc-react
 * @param localCameraTrack - Agora local camera track
 * @param localMicrophoneTrack - Agora local microphone track
 * @returns State and setters for video and audio enabled status
 */
export function useTrackToggle(
    localCameraTrack: any,
    localMicrophoneTrack: any
) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Effect to enable/disable camera track when toggle changes
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(isVideoEnabled);
        }
    }, [localCameraTrack, isVideoEnabled]);

    // Effect to enable/disable microphone track when toggle changes
    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(isAudioEnabled);
        }
    }, [localMicrophoneTrack, isAudioEnabled]);

    return {
        isVideoEnabled,
        setIsVideoEnabled,
        isAudioEnabled,
        setIsAudioEnabled
    };
}
