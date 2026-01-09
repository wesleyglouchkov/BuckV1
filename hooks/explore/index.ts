"use client";

import useSWR from "swr";
import { streamService } from "@/services/stream";

export interface SidebarStream {
    id: string;
    title: string;
    viewerCount: number;
    thumbnail: string | null;
    createdAt: string | Date;
    isLive: boolean;
    creator: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

export interface SidebarCategory {
    name: string;
    count: number;
    previewStreams: SidebarStream[];
}

interface ExploreSidebarResponse {
    success: boolean;
    streams: SidebarStream[];
    categories: SidebarCategory[];
}

export function useExploreSidebarData() {
    const { data, error, isLoading, mutate } = useSWR<ExploreSidebarResponse>(
        "/streams/explore/sidebar",
        () => streamService.getExploreSidebarData(),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 60000, // Refresh every minute
            dedupingInterval: 5000,
        }
    );

    return {
        streams: data?.streams || [],
        categories: data?.categories || [],
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}
