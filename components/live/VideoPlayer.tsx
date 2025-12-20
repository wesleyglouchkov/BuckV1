"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VideoPlayerProps {
    src: string;
    title?: string;
    poster?: string;
}

export default function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
    return (
        <div className="w-full aspect-video overflow-hidden border border-border shadow-lg">
            <MediaPlayer
                title={title}
                src={src}
                poster={poster}
                aspectRatio="16/9"
                load="eager"
                className="w-full h-full"
            >
                <MediaProvider />
                <DefaultVideoLayout
                    icons={defaultLayoutIcons}
                />
            </MediaPlayer>
        </div>
    );
}
