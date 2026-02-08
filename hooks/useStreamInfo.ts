import useSWR from "swr";
import { streamService } from "@/services/stream";

interface UseStreamInfoReturn {
    participantCount: number;
    viewerCount: number;
    isLoading: boolean;
    error: any;
}

export function useStreamInfo(streamId: string): UseStreamInfoReturn {
    const { data, error, isLoading } = useSWR(
        streamId ? `/streams/${streamId}/stream-info` : null, // Unique key for SWR cache
        async () => {
            const response = await streamService.getStreamInfo(streamId);
            return response;
        },
        {
            refreshInterval: 5000, // Poll every 5 seconds
            revalidateOnFocus: true,
            dedupingInterval: 2000,
        }
    );

    const participantCount = data?.participantCount || 0;
    const viewerCount = data?.viewerCount || 0;

    return {
        participantCount,
        viewerCount,
        isLoading,
        error
    };
}
