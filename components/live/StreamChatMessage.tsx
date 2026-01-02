"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useStreamChat";

interface StreamChatMessageProps {
    msg: ChatMessage;
    color: string;
}

export const StreamChatMessage = memo(function StreamChatMessage({ msg, color }: StreamChatMessageProps) {
    if (msg.userId === "system") {
        return (
            <div className={cn(
                "flex flex-col px-2 py-1.5 transition-colors items-center",
            )}>
                <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-full">
                    {msg.message}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex flex-col px-2 py-1.5 transition-colors hover:bg-muted/30"
        )}>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span
                        className="text-sm font-bold"
                        style={{
                            color: msg.isCreator ? 'rgb(59, 130, 246)' : color
                        }}
                    >
                        {msg.username}
                        {msg.isCreator && (
                            <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                Creator
                            </span>
                        )}
                    </span>
                </div>
                <p className="text-sm text-foreground/90 wrap-break-word">
                    {msg.message}
                </p>
            </div>
        </div>
    );
});
