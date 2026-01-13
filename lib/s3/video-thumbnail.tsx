"use client";

import React, { useState } from 'react';

interface VideoSnapshotProps {
    src: string;
    className?: string;
    time?: number;
    poster?: string;
}

/**
 * Reusable Video Snapshot component that displays a specific frame of a video as a thumbnail.
 * Uses the #t= fragment to tell the browser to load the video at a specific time.
 */
export const VideoSnapshot = ({
    src,
    className = "w-full h-full object-cover",
    time = 1,
    poster
}: VideoSnapshotProps) => {
    const [isLoaded, setIsLoaded] = useState(false);

    if (!src) return null;

    // Standard way to show a frame from a video: append #t=TIME to the URL
    // This allows the browser to seek to the frame efficiently during preload.
    const videoUrl = src.includes('#t=') ? src : `${src}#t=${time}`;

    return (
        <video
            src={videoUrl}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-70'} bg-black/20`}
            muted
            playsInline
            preload="metadata"
            poster={poster}
            onLoadedData={() => setIsLoaded(true)}
            style={{ transition: 'opacity 0.4s ease-in-out' }}
        />
    );
};
