"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SignalingManager, SignalingMessage } from "@/lib/agora/agora-rtm";
import { globalRTMSingleton as rtmSingleton, resetRTMInstance } from "@/lib/agora/rtm-singleton";

interface UseRTMClientProps {
    appId: string;
    channelName: string;
    uid: number;
    rtmToken: string;
    userName?: string;
    userAvatar?: string;
    role?: string;
    onMessage?: (msg: SignalingMessage) => void;
    onPresence?: (p: any) => void;
}

export function useRTMClient({
    appId,
    channelName,
    uid,
    rtmToken,
    userName,
    userAvatar,
    role = "viewer",
    onMessage,
    onPresence
}: UseRTMClientProps) {
    const [isRTMReady, setIsRTMReady] = useState(false);

    // Refs to hold latest callbacks to avoid re-init
    const onMessageRef = useRef(onMessage);
    const onPresenceRef = useRef(onPresence);

    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onPresenceRef.current = onPresence; }, [onPresence]);

    useEffect(() => {
        if (!appId || !uid || !channelName || !rtmToken) {
            console.log(`RTM ${role}: Missing required params`);
            return;
        }

        // If singleton already exists for this channel, reuse it
        if (rtmSingleton.instance && rtmSingleton.channelName === channelName) {
            console.log(`RTM ${role}: Reusing existing singleton instance`);

            // Re-bind listeners
            if (onMessageRef.current) rtmSingleton.instance.onMessage(onMessageRef.current);
            if (onPresenceRef.current) rtmSingleton.instance.onPresence(onPresenceRef.current);

            // Announce self
            if (userName) {
                rtmSingleton.instance.setUserPresence(userName, userAvatar);
            }

            setIsRTMReady(true);
            return;
        }

        // If already initializing, just subscribe to updates
        if (rtmSingleton.isInitializing) {
            console.log(`RTM ${role}: Already initializing, subscribing to updates`);
            const callback = (ready: boolean) => setIsRTMReady(ready);
            rtmSingleton.subscribers.add(callback);
            return () => {
                rtmSingleton.subscribers.delete(callback);
            };
        }

        // Start initialization
        rtmSingleton.isInitializing = true;
        rtmSingleton.channelName = channelName;
        // For viewer specific logic, we might need to set uid on singleton if needed, but keeping it generic here.
        if (role !== 'host') {
            rtmSingleton.uid = uid;
        }

        const initRTM = async (retryCount = 0): Promise<void> => {
            const maxRetries = 3;

            try {
                if (rtmSingleton.instance) {
                    console.log(`RTM ${role}: Instance already exists, skipping`);
                    if (onMessageRef.current) rtmSingleton.instance.onMessage(onMessageRef.current);
                    if (onPresenceRef.current) rtmSingleton.instance.onPresence(onPresenceRef.current);
                    setIsRTMReady(true);
                    rtmSingleton.isInitializing = false;
                    return;
                }

                console.log(`RTM ${role} Init:`, { channelName, uid });
                const sm = new SignalingManager(appId, uid, channelName);

                if (onMessageRef.current) sm.onMessage(onMessageRef.current);
                if (onPresenceRef.current) sm.onPresence(onPresenceRef.current);

                await sm.login(rtmToken);

                console.log(`RTM ${role}: Login successful`);

                rtmSingleton.instance = sm;
                rtmSingleton.isInitializing = false;
                setIsRTMReady(true);

                rtmSingleton.subscribers.forEach(cb => cb(true));

                if (userName) {
                    sm.setUserPresence(userName, userAvatar).catch(err => {
                        console.warn(`RTM ${role}: Failed to set initial background presence:`, err);
                    });
                }
            } catch (err: any) {
                console.warn(`RTM ${role}: Login failed (attempt ${retryCount + 1}/${maxRetries}):`, err?.message || err);

                if (retryCount < maxRetries - 1) {
                    const delay = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return initRTM(retryCount + 1);
                }

                console.error(`RTM ${role}: All login attempts failed`);
                rtmSingleton.isInitializing = false;
                rtmSingleton.subscribers.forEach(cb => cb(false));
            }
        };

        initRTM();
    }, [appId, uid, channelName, rtmToken, role, userName, userAvatar]);

    const cleanupRTM = useCallback(() => {
        console.log(`RTM ${role}: Cleaning up singleton via resetRTMInstance`);
        resetRTMInstance();
    }, [role]);

    return { isRTMReady, cleanupRTM };
}
