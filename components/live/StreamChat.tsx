"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, X, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    isCreator?: boolean;
}

interface StreamChatProps {
    streamId: string;
    currentUserId?: string;
    currentUsername?: string;
    isCreator?: boolean;
    onClose?: () => void;
}

export default function StreamChat({
    streamId,
    currentUserId,
    currentUsername = "Anonymous",
    isCreator = false,
    onClose,
}: StreamChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Simulate connection (in production, use WebSockets or similar)
    useEffect(() => {
        setIsConnected(true);

        // Add welcome message
        setMessages([
            {
                id: "welcome",
                userId: "system",
                username: "System",
                message: "Welcome to the live chat! Be respectful and enjoy the stream.",
                timestamp: new Date(),
            },
        ]);
    }, [streamId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentUserId) return;

        const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: currentUserId,
            username: currentUsername,
            message: newMessage.trim(),
            timestamp: new Date(),
            isCreator,
        };

        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        setShowEmojiPicker(false);

        // In production, send to backend/websocket here
    };

    return (
        <div className="flex lg:border-l border-primary flex-col h-full bg-card overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Live Chat</h3>
                    <div className="ml-auto flex items-center gap-2">
                        {isConnected && (
                            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="mt-1">Connected</span>
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:hidden dark:text-white"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col",
                            msg.userId === "system" && "items-center"
                        )}
                    >
                        {msg.userId === "system" ? (
                            <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-full">
                                {msg.message}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            msg.isCreator ? "text-primary" : "text-foreground"
                                        )}
                                    >
                                        {msg.username}
                                        {msg.isCreator && (
                                            <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                Creator
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/90 break-words">
                                    {msg.message}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                className="p-3 border-none bg-card relative"
            >
                {showEmojiPicker && (
                    <div className="absolute bottom-16 right-4 z-50 shadow-xl border border-border rounded-xl overflow-hidden" ref={emojiPickerRef}>
                        <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={(emojiData: EmojiClickData) => {
                                setNewMessage((prev) => prev + emojiData.emoji);
                            }}
                            width={300}
                            height={400}
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Send a message..."
                            className="w-full pr-10" // Add padding for emoji button
                            maxLength={200}
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <Button
                        type="submit"
                        size="default"
                        disabled={!newMessage.trim()}
                        className="shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
