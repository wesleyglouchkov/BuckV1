import { useState, useEffect, useCallback, useRef } from "react";
import useSWR, { mutate } from "swr";
import { streamService } from "@/services/stream";
import { SignalingManager, SignalingMessage } from "@/lib/agora/agora-rtm";

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
    isCreator?: boolean;
}

interface UseStreamChatProps {
    streamId: string;
    currentUserId?: string;
    currentUsername?: string;
    isCreator?: boolean;
    rtmManager?: SignalingManager | null;
}

interface ChatHistoryResponse {
    success: boolean;
    messages: Array<{
        id: string;
        userId: string;
        message: string;
        createdAt: string;
        user?: {
            name?: string;
            username?: string;
        };
        stream?: {
            creatorId?: string;
        };
    }>;
}

export function useStreamChat({
    streamId,
    currentUserId,
    currentUsername = "Anonymous",
    isCreator = false,
    rtmManager,
}: UseStreamChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch chat history using useSWR
    const { data: chatHistory, error } = useSWR<ChatHistoryResponse>(
        streamId ? `/streams/${streamId}/chat` : null,
        () => streamService.getChatMessages(streamId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5000,
        }
    );

    // Load chat history on mount
    useEffect(() => {
        if (chatHistory?.success && chatHistory.messages) {
            const formattedMessages: ChatMessage[] = chatHistory.messages.map((msg) => {
                const isCreator = msg.userId === msg.stream?.creatorId;
                // Creator shows name, others show username
                const displayName = isCreator
                    ? (msg.user?.name || msg.user?.username || `User ${msg.userId}`)
                    : (msg.user?.username || `User ${msg.userId}`);

                return {
                    id: msg.id,
                    userId: msg.userId,
                    username: displayName,
                    message: msg.message,
                    timestamp: new Date(msg.createdAt),
                    isCreator,
                };
            });

            setMessages(formattedMessages);
        }
    }, [chatHistory]);

    // Set connection status based on RTM - event-driven approach
    useEffect(() => {
        if (!rtmManager) {
            setIsConnected(false);
            return;
        }

        // Register callback for connection status changes
        rtmManager.onConnectionChange((connected) => {
            console.log('RTM connection status changed:', connected);
            setIsConnected(connected);
        });

        // No cleanup needed - RTM manager handles its own lifecycle
    }, [rtmManager]);

    // Listen for real-time chat messages via RTM
    useEffect(() => {
        if (!rtmManager) return;

        const handleChatMessage = (msg: SignalingMessage & { type: "CHAT_MESSAGE" }) => {
            console.log("Real-time chat message received:", msg);

            // Filter out own messages to prevent duplication (as we add them optimistically)
            if (currentUserId && msg.payload.userId.toString() === currentUserId.toString()) {
                return;
            }

            const newMessage: ChatMessage = {
                id: `rtm-${msg.payload.timestamp}`,
                userId: msg.payload.userId.toString(),
                username: msg.payload.username,
                message: msg.payload.message,
                timestamp: new Date(msg.payload.timestamp),
                isCreator: msg.payload.isCreator || false,
            };

            // Add to local state (optimistic update)
            setMessages((prev) => [...prev, newMessage]);
        };

        rtmManager.onChatMessage(handleChatMessage);

        return () => {
            // Note: We don't cleanup RTM here as it's managed by parent components
        };
    }, [rtmManager, currentUserId]);

    // Send message function
    const lastSentRef = useRef<number>(0);
    const RATE_LIMIT_MS = 1000; // 1 second between messages

    const sendMessage = useCallback(
        async (messageText: string) => {
            if (!messageText.trim() || !currentUserId || !rtmManager) {
                console.warn("Cannot send message: missing requirements");
                return;
            }

            // Rate limiting check
            const now = Date.now();
            if (now - lastSentRef.current < RATE_LIMIT_MS) {
                throw new Error("Please wait a moment before sending another message");
            }

            lastSentRef.current = now;

            const timestamp = Date.now();
            const optimisticMessage: ChatMessage = {
                id: `temp-${timestamp}`,
                userId: currentUserId,
                username: currentUsername,
                message: messageText.trim(),
                timestamp: new Date(timestamp),
                isCreator,
            };

            // Optimistic UI update
            setMessages((prev) => [...prev, optimisticMessage]);

            try {
                // 1. Send via RTM for instant delivery
                const rtmMessage: SignalingMessage = {
                    type: "CHAT_MESSAGE",
                    payload: {
                        userId: currentUserId,
                        username: currentUsername,
                        message: messageText.trim(),
                        timestamp,
                        isCreator,
                    },
                };

                console.log('Sending chat message:', {
                    userId: currentUserId,
                    username: currentUsername,
                    isCreator,
                    message: messageText.trim()
                });

                await rtmManager.sendMessage(rtmMessage);

                // 2. Persist to database
                // Note: With 5000 users, this endpoint will be heavy.
                // Ideally this should be offloaded to a queue or background job on the backend.
                await streamService.sendChatMessage(streamId, messageText.trim());

                // Revalidate chat history after successful send
                mutate(`/streams/${streamId}/chat`);
            } catch (error) {
                console.error("Failed to send chat message:", error);

                // Remove optimistic message on error
                setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));

                throw error;
            }
        },
        [streamId, currentUserId, currentUsername, isCreator, rtmManager]
    );

    return {
        messages,
        sendMessage,
        isLoading: !chatHistory && !error,
        isError: !!error,
        isConnected,
    };
}
