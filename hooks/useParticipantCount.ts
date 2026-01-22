import useSWR from "swr";
import { streamService } from "@/services/stream";
import { useState, useEffect } from "react";

interface UseParticipantCountReturn {
    participantCount: number;
    isFull: boolean;
    isLoading: boolean;
    error: any;
}

export function useParticipantCount(streamId: string): UseParticipantCountReturn {
    const { data, error, isLoading } = useSWR(
        streamId ? `/streams/${streamId}/participant-count` : null, // Unique key for SWR cache
        async () => {
            const response = await streamService.getParticipantCount(streamId);
            return response;
        },
        {
            refreshInterval: 5000, // Poll every 5 seconds
            revalidateOnFocus: true,
            dedupingInterval: 2000,
        }
    );

    const participantCount = data?.participantCount || 0;
    const isFull = participantCount >= 10;

    return {
        participantCount,
        isFull,
        isLoading,
        error
    };
}
