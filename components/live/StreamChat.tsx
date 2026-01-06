"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, X, Smile, Loader2 } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useStreamChat, ChatMessage } from "@/hooks/useStreamChat";
import { SignalingManager } from "@/lib/agora/agora-rtm";
import { getRTMInstance } from "@/lib/agora/rtm-singleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChatNotification } from "./ChatNotification";
import { StreamChatMessage } from "./StreamChatMessage";
import { ReportDialog } from "./ReportDialog";

interface StreamChatProps {
    streamId: string;
    streamTitle?: string;
    currentUserId?: string;
    currentUsername?: string;
    isCreator?: boolean;
    onClose?: () => void;
    rtmManager?: SignalingManager | null; // Shared RTM instance
    isChatVisible?: boolean; // For notification visibility
}

export default function StreamChat({ streamId, streamTitle, currentUserId, currentUsername = "Anonymous", isCreator = false, onClose, rtmManager, isChatVisible = true }: StreamChatProps) {
    const router = useRouter();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState<{
        id: string;
        username: string;
        message: string;
        isCreator?: boolean;
        timestamp: Date;
    } | null>(null);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);

    // Use provided RTM manager or try to get from the global singleton
    const effectiveRTMManager = rtmManager || getRTMInstance();

    // Generate consistent color from username (no blue - reserved for creator)
    const getUserColor = (username: string): string => {
        const colors = [
            'rgb(239, 68, 68)',   // red
            'rgb(249, 115, 22)',  // orange
            'rgb(234, 179, 8)',   // yellow
            'rgb(34, 197, 94)',   // green
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

    // Use the chat hook
    const { messages, sendMessage, isLoading, isConnected } = useStreamChat({
        streamId,
        currentUserId,
        currentUsername,
        isCreator,
        rtmManager: effectiveRTMManager,
    });

    // Show notification for new messages when chat is hidden
    useEffect(() => {
        if (isChatVisible || messages.length === 0) return;

        const latestMessage = messages[messages.length - 1];
        setNotificationMessage({
            id: latestMessage.id,
            username: latestMessage.username,
            message: latestMessage.message,
            isCreator: latestMessage.isCreator,
            timestamp: latestMessage.timestamp
        });
    }, [messages, isChatVisible]);
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if user is logged in
        if (!currentUserId) {
            setShowLoginDialog(true);
            return;
        }

        if (!newMessage.trim() || isSending) return;

        try {
            setIsSending(true);
            await sendMessage(newMessage);
            setNewMessage("");
            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleLoginRedirect = () => {
        const currentUrl = window.location.href;
        const callbackUrl = encodeURIComponent(currentUrl);
        router.push(`/login?callbackUrl=${callbackUrl}`);
    };

    return (
        <div className="flex lg:border-l border-primary flex-col h-full bg-card overflow-hidden cursor-pointer">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-card ">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground mt-1">Live Chat</h3>
                    <div className="ml-auto flex items-center gap-2">
                        {isConnected && (
                            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="mt-1">Connected</span>
                            </span>
                        )}
                        {!isConnected && rtmManager && (
                            <span className="mt-1 flex items-center gap-1.5 text-xs text-yellow-600">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                <span className="mt-1">Connecting...</span>
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
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No messages yet</p>
                            <p className="text-xs mt-1">Be the first to say something!</p>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <StreamChatMessage
                        key={msg.id}
                        msg={msg}
                        color={getUserColor(msg.username)}
                        currentUserId={currentUserId}
                        streamId={streamId}
                        streamTitle={streamTitle}
                        onReport={(message) => {
                            setReportingMessage(message);
                            setReportDialogOpen(true);
                        }}
                    />
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
                            placeholder={!currentUserId ? "Login to chat..." : "Send a message..."}
                            className="w-full pr-10"
                            maxLength={200}
                            disabled={isCreator ? false : (currentUserId ? !isConnected : false)}
                            onFocus={() => {
                                if (!currentUserId) {
                                    setShowLoginDialog(true);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (!currentUserId) {
                                    setShowLoginDialog(true);
                                } else {
                                    setShowEmojiPicker(!showEmojiPicker);
                                }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                            disabled={isCreator ? false : (currentUserId ? !isConnected : false)}
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <Button
                        type="submit"
                        size="default"
                        disabled={!newMessage.trim() || isSending || (isCreator ? false : (currentUserId ? !isConnected : true))}
                        className="shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>

            {/* Login Dialog */}
            <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Join the Conversation</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Create an account or log in to chat with the creator and other viewers!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel className="bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-300 mt-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLoginRedirect}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            Log in / Sign up
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Chat Notification Overlay (shows when chat is hidden) */}
            <ChatNotification
                message={notificationMessage}
                onDismiss={() => setNotificationMessage(null)}
            />

            {/* Report Dialog */}
            {reportDialogOpen && <ReportDialog
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
                reportType="message"
                senderId={reportingMessage?.userId || ""}
                senderName={reportingMessage?.username || ""}
                messageId={reportingMessage?.id}
                messageContent={reportingMessage?.message}
                streamId={streamId}
                streamTitle={streamTitle}
                currentUserId={currentUserId}
            />}
        </div>
    );
}
