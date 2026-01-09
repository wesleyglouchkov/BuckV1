"use client";

import useSWR from "swr";
import { streamService } from "@/services/stream";

export interface SidebarStream {
    id: string;
    title: string;
    viewerCount: number;
    thumbnail: string | null;
    creator: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

interface SidebarStreamsResponse {
    success: boolean;
    streams: SidebarStream[];
}

export function useSidebarStreams() {
    const { data, error, isLoading, mutate } = useSWR<SidebarStreamsResponse>(
        "/streams/sidebar",
        () => streamService.getSidebarStreams(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 30000, // Refresh every 30 seconds to keep viewer counts updated
            dedupingInterval: 5000,
        }
    );

    return {
        streams: data?.streams || [],
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}
