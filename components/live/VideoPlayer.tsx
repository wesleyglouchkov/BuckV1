"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Global CSS to hide Audio menu item
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .vds-audio-menu,
        .vds-audio-menu[data-submenu],
        div.vds-audio-menu.vds-menu {
            display: none !important;
        }
    `;
    if (!document.querySelector('#hide-audio-menu')) {
        style.id = 'hide-audio-menu';
        document.head.appendChild(style);
    }
}

interface VideoPlayerProps {
    src: string;
    title?: string;
    poster?: string;
}

export default function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!src) {
        return (
            <div className="w-full aspect-video flex items-center justify-center bg-muted border border-border">
                <p className="text-muted-foreground">No video source available</p>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="w-full h-full">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    return (
        <div className="w-full h-full border border-border shadow-lg bg-black">
            <MediaPlayer
                key={src}
                title={title || "Video"}
                src={src}
                poster={poster}
                aspectRatio="16/9"
                load="idle"
                playsInline
                storage={null}
                fullscreenOrientation="landscape"
                className="w-full h-full [&_video]:object-contain"
            >
                <MediaProvider />
                <BufferingIndicator />
                <DefaultVideoLayout
                    icons={defaultLayoutIcons}
                    hideQualityBitrate
                    slots={{
                        googleCastButton: null,
                        airPlayButton: null,
                    }}
                />
            </MediaPlayer>
        </div>
    );
}

// Buffering Indicator with Primary Color
function BufferingIndicator() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-0 data-buffering:opacity-100 transition-opacity">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
