"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ChatMessage {
    id: string;
    username: string;
    message: string;
    isCreator?: boolean;
    timestamp: Date;
}

interface ChatNotificationProps {
    message: ChatMessage | null;
    onDismiss: () => void;
}

export function ChatNotification({ message, onDismiss }: ChatNotificationProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!message) return;

        // Auto-dismiss after 1.8 seconds
        const timer = setTimeout(() => {
            onDismiss();
        }, 1800);

        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    // Generate consistent color from username (no blue - reserved for creator)
    const getUserColor = (username: string): string => {
        const colors = [
            'rgb(239, 68, 68)',   // red
            'rgb(249, 115, 22)',  // orange
            'rgb(234, 179, 8)',   // yellow
            'rgb(34, 197, 94)',   // green
            'rgb(20, 184, 166)',  // teal
            'rgb(168, 85, 247)',  // purple
            'rgb(236, 72, 153)',  // pink
            'rgb(244, 63, 94)',   // rose
        ];

        // Create consistent hash from username
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    if (!mounted || !message) return null;

    // Don't show if message is older than 2 seconds
    const messageAge = Date.now() - message.timestamp.getTime();
    if (messageAge > 2000) {
        return null;
    }

    const content = (
        <div
            className="fixed top-20 right-6 md:top-24 md:right-8 w-[280px] md:w-[320px] z-9999 animate-in slide-in-from-right duration-300 cursor-pointer"
            onClick={onDismiss}
        >
            {/* Glassmorphism container */}
            <div className="relative backdrop-blur-xl bg-background/70 border border-white/20 rounded-xl p-3 shadow-2xl overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-sm font-bold truncate"
                            style={{
                                color: message.isCreator ? 'rgb(59, 130, 246)' : getUserColor(message.username)
                            }}
                        >
                            {message.username}
                        </span>
                        {message.isCreator && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                                Creator
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-foreground/90 line-clamp-2">
                        {message.message}
                    </p>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
