import { SignalingManager } from "./agora-rtm";

// Global RTM singleton for sharing across components
// This prevents multiple RTM instances per user
export const globalRTMSingleton: {
    instance: SignalingManager | null;
    isInitializing: boolean;
    channelName: string | null;
    uid: number | null; // For viewers
    currentUidRef: { current: number | null }; // For viewer message handling
    subscribers: Set<(ready: boolean) => void>;
} =

{
    instance: null,
    isInitializing: false,
    channelName: null,
    uid: null,
    currentUidRef: { current: null },
    subscribers: new Set(),
};

export function getRTMInstance(): SignalingManager | null {
    return globalRTMSingleton.instance;
}

export function setRTMInstance(instance: SignalingManager | null): void {
    globalRTMSingleton.instance = instance;
}

export function isRTMInitializing(): boolean {
    return globalRTMSingleton.isInitializing;
}

export function getRTMChannelName(): string | null {
    return globalRTMSingleton.channelName;
}
