"use client";

import AgoraRTM from "agora-rtm-sdk";

export type SignalingMessage = {
    type: "MUTE_USER";
    payload: {
        userId: string | number;
        mediaType: "audio" | "video";
        mute: boolean;
    };
};

export class SignalingManager {
    private client: any = null;
    private appId: string;
    private userId: string;
    private channelName: string;
    private isJoined: boolean = false;
    private isLoggingIn: boolean = false; // Prevent duplicate login attempts

    constructor(appId: string, userId: string | number, channelName: string) {
        this.appId = appId;
        this.userId = userId.toString();
        this.channelName = channelName;
    }

    async login(token: string): Promise<void> {
        if (this.isJoined || this.isLoggingIn) return;
        this.isLoggingIn = true;

        try {
            // @ts-ignore
            this.client = new AgoraRTM.RTM(this.appId, this.userId);

            // Add status listener
            this.client.addEventListener("status", (event: any) => {
                console.log("RTM Status:", event);
                if (event.state === "DISCONNECTED") this.isJoined = false;
            });

            // Add message listener
            this.client.addEventListener("message", (event: any) => {
                console.log("RTM Message Received:", event); // Debug log
                try {
                    // Try to parse payload
                    const data = JSON.parse(event.message as string);
                    // Emit to our internal listeners if we had a proper event emitter, 
                    // for now we rely on the callback set via onMessage
                    if (this.onMessageCallback) {
                        this.onMessageCallback(data);
                    }
                } catch (e) {
                    console.warn("RTM Parse Error:", e);
                }
            });

            // 1. Login
            await this.client.login({ token });
            this.isJoined = true;
            console.log("RTM Logged In");

            // 2. Subscribe to the channel (Required in V2 to receive messages)
            try {
                await this.client.subscribe(this.channelName, {
                    withMessage: true,
                    withPresence: true
                });
                console.log("RTM Subscribed to:", this.channelName);
            } catch (subError) {
                console.error("RTM Subscription failed:", subError);
            }

        } catch (error: any) {
            if (error?.code === -10006) {
                this.isJoined = true; // Already logged in
            } else {
                console.error("RTM Login Failed:", error);
                throw error;
            }
        } finally {
            this.isLoggingIn = false;
        }
    }

    // callback storage
    private onMessageCallback: ((message: SignalingMessage) => void) | null = null;

    onMessage(callback: (message: SignalingMessage) => void) {
        this.onMessageCallback = callback;
    }

    async logout(): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.unsubscribe(this.channelName);
            await this.client.logout();
            this.isJoined = false;
        } catch (error) {
            console.error("RTM Logout Failed:", error);
        }
    }

    async sendMessage(message: SignalingMessage): Promise<void> {
        if (!this.client || !this.isJoined) {
            console.warn("RTM not connected. Attempting to send anyway...");
        }

        const payload = JSON.stringify(message);
        try {
            // Use 'publish' for Message Channel
            await this.client.publish(this.channelName, payload);
            console.log("RTM Message Sent:", message);
        } catch (error) {
            console.error("RTM Publish Failed:", error);
            throw error;
        }
    }
}