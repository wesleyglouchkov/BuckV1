// export const hostVideoConfig = {
//     width: 1920,
//     height: 1080,
//     frameRate: 60,
//     bitrateMin: 2000, // Minimum fallback bitrate
//     bitrateMax: 4780, // Agora's recommended max for 1080p60
//     codec: "h264",
// } as const;

export const hostVideoConfig = "1080p_5" as const; 

export const participantVideoConfig = {
     // 1280×720 @ 30fps, 2000 Kbps
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrateMin: 600,
    bitrateMax: 2000,
    codec: "h264",
}