import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { streamService } from "@/services/stream";
import { SignalingManager } from "@/lib/agora-rtm";

interface UseViewerCountProps {
    streamId: string;
    rtmManager?: SignalingManager | null;
    isHost?: boolean;
    syncIntervalSeconds?: number; // How often host syncs to DB (default: 60)
}

export function useViewerCount({
    streamId,
    rtmManager,
    isHost = false,
    syncIntervalSeconds = 60,
}: UseViewerCountProps) {
    const [realtimeCount, setRealtimeCount] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    // Get realtime count from RTM manager
    useEffect(() => {
        if (!rtmManager) return;

        const updateCount = () => {
            const count = rtmManager.getMemberCount();
            setRealtimeCount(count);
        };

        // Update immediately
        updateCount();

        // Update on presence changes
        const handlePresence = () => {
            updateCount();
        };

        rtmManager.onPresence(handlePresence);

        // Poll for updates every 2 seconds as fallback
        const interval = setInterval(updateCount, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [rtmManager]);

    // Host: Sync realtime count to database periodically
    useEffect(() => {
        if (!isHost || !streamId || !rtmManager) return;

        const syncToDatabase = async () => {
            try {
                setIsUpdating(true);
                const count = rtmManager.getMemberCount();
                await streamService.updateStreamStats(streamId, count);
                console.log(`Viewer count synced to DB: ${count}`);
            } catch (error) {
                console.error("Failed to sync viewer count to DB:", error);
            } finally {
                setIsUpdating(false);
            }
        };

        // Sync immediately
        syncToDatabase();

        // Then sync periodically
        const interval = setInterval(syncToDatabase, syncIntervalSeconds * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [isHost, streamId, rtmManager, syncIntervalSeconds]);

    return {
        viewerCount: realtimeCount,
        isUpdating,
    };
}
