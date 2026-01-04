import React from 'react';

interface VideoSnapshotProps {
    src: string;
    className?: string;
    time?: number;
}

/**
 * Reusable Video Snapshot component that displays a specific frame of a video as a thumbnail.
 * Uses the #t= fragment to tell the browser to load the video at a specific time.
 */
export const VideoSnapshot = ({
    src,
    className = "w-full h-full object-cover",
    time = 1
}: VideoSnapshotProps) => {
    if (!src) return null;

    return (
        <video
            src={`${src}#t=${time}`}
            className={className}
            muted
            playsInline
            preload="metadata"
        />
    );
};
