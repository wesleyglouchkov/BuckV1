"use client";

import { MediaPlayer, MediaProvider, Spinner } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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

interface ModerationVideoPlayerProps {
    src: string;
    title?: string;
    poster?: string;
}

export default function ModerationVideoPlayer({ src, title, poster }: ModerationVideoPlayerProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!src) {
        return (
            <div className="w-full aspect-video flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">No video source available</p>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="w-full aspect-video flex items-center justify-center bg-black rounded-md">
                <div className="animate-pulse text-white">Loading player...</div>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video overflow-hidden rounded-md">
            <MediaPlayer
                key={src}
                title={title || "Moderation Video"}
                src={src}
                poster={poster}
                aspectRatio="16/9"
                load="idle"
                playsInline
                storage={null}
                className="w-full h-full"
            >
                <MediaProvider />
                <BufferingIndicator />
                <DefaultVideoLayout
                    icons={defaultLayoutIcons}
                    hideQualityBitrate
                    slots={{
                        googleCastButton: null,
                        airPlayButton: null,
                        // pipButton: null,
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
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );
}
