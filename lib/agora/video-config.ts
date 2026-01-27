export const hostVideoConfig = {
    width: 1920,
    height: 1080,
    frameRate: 60,
    bitrate: 6500, // sweet spot for 1080p60 on WebRTC
    codec: "h264",
    degradationPreference: "maintain-framerate"
} as const;

export const participantVideoConfig = {
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrate: 3500, // 720p_2 preset recommendation
    codec: "h264",
    degradationPreference: "maintain-framerate"
} as const;
