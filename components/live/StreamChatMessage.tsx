"use client";

import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useStreamChat";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StreamChatMessageProps {
    msg: ChatMessage;
    color: string;
    currentUserId?: string;
    streamId: string;
    streamTitle?: string;
    onReport?: (msg: ChatMessage) => void;
}

export const StreamChatMessage = memo(function StreamChatMessage({
    msg,
    color,
    currentUserId,
    streamId,
    streamTitle,
    onReport
}: StreamChatMessageProps) {
    const [isHovered, setIsHovered] = useState(false);

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

    // Allow reporting any message except your own
    const canReport = currentUserId && currentUserId !== msg.userId;

    return (
        <div
            className={cn(
                "group/message flex px-2 py-1.5 transition-colors hover:bg-muted/30 relative"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex-1 space-y-1">
                <div className="flex items-start gap-2">
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
                <p className="text-sm text-foreground/90 dark:text-foreground/90 wrap-break-word">
                    {msg.message}
                </p>
            </div>

            {/* Report Button - Centered vertically, Shows on hover */}
            {canReport && (
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-muted dark:hover:bg-muted dark:text-white",
                                    isHovered && "opacity-100"
                                )}
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => onReport?.(msg)}
                            >
                                Report Message
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
});
