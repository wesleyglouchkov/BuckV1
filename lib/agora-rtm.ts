"use client";

import AgoraRTM from "agora-rtm-sdk";

export type SignalingMessage =
    | {
        type: "MUTE_USER";
        payload: {
            userId: string | number;
            mediaType: "audio" | "video";
            mute: boolean;
        };
    }
    | {
        type: "KICK_USER";
        payload: {
            userId: string | number;
            mediaType: "all";
            mute: boolean;
        };
    };

export class SignalingManager {
    private client: any = null;
    private appId: string;
    private userId: string;
    private channelName: string;
    private isJoined: boolean = false;
    private isLoggingIn: boolean = false;
    private onMessageCallback: ((message: SignalingMessage) => void) | null = null;

    constructor(appId: string, userId: string | number, channelName: string) {
        this.appId = appId;
        this.userId = userId.toString();
        this.channelName = channelName;
    }

    async login(token: string): Promise<void> {
        if (this.isJoined || this.isLoggingIn) {
            console.log("RTM: Already logged in or logging in");
            return;
        }
        this.isLoggingIn = true;

        try {
            // @ts-ignore - Agora RTM SDK types
            this.client = new AgoraRTM.RTM(this.appId, this.userId, {
                // Enable presence and message channels
                useStringUserId: true
            });

            console.log("RTM: Client created for user:", this.userId);

            // 1. Setup status listener BEFORE login
            this.client.addEventListener("status", (event: any) => {
                console.log("RTM Status Changed:", event);
                if (event.state === "DISCONNECTED") {
                    this.isJoined = false;
                }
                if (event.state === "CONNECTED") {
                    this.isJoined = true;
                }
            });

            // 2. Setup message listener BEFORE subscribing
            this.client.addEventListener("message", (event: any) => {
                console.log("RTM Message Event Received:", event);
                
                // Handle different message sources
                if (event.channelType === "MESSAGE" && event.channelName === this.channelName) {
                    try {
                        const message = event.message;
                        let data: SignalingMessage;
                        
                        // Parse message (might be string or object)
                        if (typeof message === "string") {
                            data = JSON.parse(message);
                        } else {
                            data = message;
                        }
                        
                        console.log("RTM Parsed Message:", data);
                        
                        // Call the registered callback
                        if (this.onMessageCallback) {
                            this.onMessageCallback(data);
                        }
                    } catch (e) {
                        console.error("RTM Parse Error:", e, "Raw message:", event.message);
                    }
                }
            });

            // 3. Login to RTM with token
            await this.client.login({ token });
            console.log("RTM: Logged in successfully");

            // 4. Subscribe to the message channel
            try {
                const subscribeOptions = {
                    withMessage: true,
                    withPresence: true,
                    withMetadata: false,
                    withLock: false
                };
                
                await this.client.subscribe(this.channelName, subscribeOptions);
                console.log("RTM: Subscribed to channel:", this.channelName);
                this.isJoined = true;
            } catch (subError: any) {
                console.error("RTM Subscription failed:", subError);
                // If already subscribed, that's okay
                if (subError?.code === 2) {
                    console.log("RTM: Already subscribed to channel");
                    this.isJoined = true;
                } else {
                    throw subError;
                }
            }

        } catch (error: any) {
            console.error("RTM Login/Setup Failed:", error);
            
            // Handle specific error codes
            if (error?.code === -10006 || error?.message?.includes("already")) {
                console.log("RTM: Already logged in, treating as success");
                this.isJoined = true;
            } else {
                this.isLoggingIn = false;
                throw error;
            }
        } finally {
            this.isLoggingIn = false;
        }
    }

    onMessage(callback: (message: SignalingMessage) => void) {
        console.log("RTM: Message callback registered");
        this.onMessageCallback = callback;
    }

    async logout(): Promise<void> {
        if (!this.client) return;
        
        try {
            console.log("RTM: Logging out...");
            if (this.isJoined) {
                await this.client.unsubscribe(this.channelName);
                console.log("RTM: Unsubscribed from channel");
            }
            await this.client.logout();
            console.log("RTM: Logged out successfully");
            this.isJoined = false;
        } catch (error) {
            console.error("RTM Logout Failed:", error);
        }
    }

    async sendMessage(message: SignalingMessage): Promise<void> {
        if (!this.client) {
            throw new Error("RTM client not initialized");
        }

        if (!this.isJoined) {
            console.warn("RTM: Not joined to channel, attempting to send anyway...");
        }

        const payload = JSON.stringify(message);
        
        try {
            console.log("RTM: Publishing message to channel:", this.channelName, message);
            
            // Use publish method for Message Channel
            const result = await this.client.publish(this.channelName, payload, {
                channelType: "MESSAGE",
                customType: "CONTROL_MESSAGE"
            });
            
            console.log("RTM: Message published successfully:", result);
        } catch (error: any) {
            console.error("RTM Publish Failed:", error);
            console.error("Error details:", {
                code: error?.code,
                message: error?.message,
                isJoined: this.isJoined,
                channelName: this.channelName
            });
            throw error;
        }
    }

    // Helper method to check connection status
    isConnected(): boolean {
        return this.isJoined;
    }
}