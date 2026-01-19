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

/**
 * Reset the global RTM singleton. Logs out the existing instance if present and clears all stored state.
 * This helps avoid stale connections when navigating away or restarting streams.
 */
export async function resetRTMInstance(): Promise<void> {
    const instance = globalRTMSingleton.instance;
    if (instance) {
        try {
            await instance.logout();
        } catch (e) {
            console.error('RTM: Error during logout in resetRTMInstance', e);
        }
    }
    globalRTMSingleton.instance = null;
    globalRTMSingleton.isInitializing = false;
    globalRTMSingleton.channelName = null;
    globalRTMSingleton.uid = null;
    globalRTMSingleton.currentUidRef = { current: null };
    globalRTMSingleton.subscribers.clear();
}
