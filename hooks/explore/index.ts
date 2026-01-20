"use client";

import useSWR from "swr";
import { streamService } from "@/services/stream";

export interface SidebarStream {
    id: string;
    title: string;
    viewerCount: number;
    thumbnail: string | null;
    replayUrl?: string | null;
    workoutType?: string | null;
    duration?: number; // In seconds
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

interface ExploreResponse {
    success: boolean;
    streams: SidebarStream[];
    categories: SidebarCategory[];
}

export function useExploreData() {
    const { data, error, isLoading, mutate } = useSWR<ExploreResponse>(
        "/streams/explore",
        () => streamService.getExploreData(),
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

export interface SearchResultCreator {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    followers: number;
    isLive: boolean;
}

export interface SearchResultStream {
    id: string;
    title: string;
    thumbnail: string | null;
    viewerCount: number;
    isLive: boolean;
    workoutType: string;
    replayUrl: string | null;
    duration: number; // In seconds, computed from startTime - endTime
    createdAt: string | Date;
    creator: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

interface QuickSearchResponse {
    success: boolean;
    creators: SearchResultCreator[];
    streams: SearchResultStream[];
}

interface SearchResponse extends QuickSearchResponse {
    tab: string;
    total?: number;
}

export function useQuickSearch(query: string, limit: number = 5) {
    const { data, error, isLoading } = useSWR<SearchResponse>(
        query && query.length >= 1 ? [`/streams/buck-search`, 'all', query, limit] : null,
        () => streamService.buckSearch({ tab: 'all', query, limit }),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    return {
        creators: data?.creators || [],
        streams: data?.streams || [],
        isLoading: !!query && query.length >= 1 && isLoading,
        isError: !!error,
    };
}

export function useBuckSearch(params: {
    tab: string;
    query?: string;
    page?: number;
    limit?: number;
    workoutType?: string;
    isLive?: boolean;
}) {
    const { data, error, isLoading, isValidating } = useSWR<SearchResponse>(
        [
            `/streams/buck-search`,
            params.tab,
            params.query,
            params.page,
            params.limit,
            params.workoutType,
            params.isLive
        ],
        () => streamService.buckSearch(params),
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
        }
    );

    return {
        creators: data?.creators || [],
        streams: data?.streams || [],
        total: data?.total || 0,
        tab: data?.tab || params.tab,
        isLoading: isLoading,
        isValidating,
        isError: !!error,
        error
    };
}

// Creator Profile Types
export interface CreatorProfile {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    subscriptionPrice?: number | null;
    stripe_account_id?: string | null;
    stripe_connected?: boolean | null;
    stripe_onboarding_completed?: boolean | null;
    followers: number;
    subscribers: number;
}

export interface CreatorStream {
    id: string;
    title: string;
    thumbnail: string | null;
    viewerCount: number;
    isLive: boolean;
    createdAt: string;
    replayUrl: string | null;
    workoutType?: string;
    duration?: number; // In seconds
}

interface CreatorProfileResponse {
    success: boolean;
    error?: string;
    creator: CreatorProfile;
    latestStreams: CreatorStream[];
    previousStreams: CreatorStream[];
    totalStreams: number;
    totalPreviousStreams: number;
}

interface CreatorStreamsResponse {
    success: boolean;
    streams: (CreatorStream & {
        creator: {
            id: string;
            name: string;
            username: string;
            avatar: string | null;
        };
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Hook: Fetch Creator Profile by Username
export function useCreatorProfile(username: string | null) {
    const { data, error, isLoading, mutate } = useSWR<CreatorProfileResponse>(
        username ? [`/streams/creator/${username}/profile`, username] : null,
        () => streamService.getCreatorByUsername(username!),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    );

    const notFound = data?.success === false && data?.error === 'Creator not found';

    return {
        creator: data?.creator || null,
        latestStreams: data?.latestStreams || [],
        previousStreams: data?.previousStreams || [],
        totalStreams: data?.totalStreams || 0,
        totalPreviousStreams: data?.totalPreviousStreams || 0,
        isLoading,
        isError: !!error,
        notFound,
        error: error || (notFound ? 'Creator not found' : null),
        mutate,
    };
}

// Hook: Fetch Creator Streams with Pagination
export function useCreatorStreams(params: {
    creatorId: string | null;
    page?: number;
    limit?: number;
    isLive?: string | null;
}) {
    const { creatorId, page = 1, limit = 12, isLive } = params;

    const { data, error, isLoading, isValidating, mutate } = useSWR<CreatorStreamsResponse>(
        creatorId ? [`/streams/creator/${creatorId}/streams`, creatorId, page, limit, isLive] : null,
        () => streamService.getCreatorStreams({
            creatorId: creatorId!,
            page,
            limit,
            isLive: isLive || undefined
        }),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    return {
        streams: data?.streams || [],
        pagination: data?.pagination || null,
        isLoading,
        isValidating,
        isError: !!error,
        error,
        mutate,
    };
}

// Scheduled Stream Type for public view
export interface ScheduledStream {
    id: string;
    title: string;
    thumbnail: string | null;
    workoutType?: string;
    startTime: string;
    createdAt: string;
    creator: {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

interface ScheduledStreamsResponse {
    success: boolean;
    streams: ScheduledStream[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Hook: Fetch Creator's Scheduled Streams (Public - Future Only)
export function useCreatorScheduledStreams(params: {
    creatorId: string | null;
    page?: number;
    limit?: number;
}) {
    const { creatorId, page = 1, limit = 10 } = params;

    const { data, error, isLoading, isValidating, mutate } = useSWR<ScheduledStreamsResponse>(
        creatorId ? [`/streams/creator/${creatorId}/scheduled-streams`, creatorId, page, limit] : null,
        () => streamService.getCreatorScheduledStreams({
            creatorId: creatorId!,
            page,
            limit
        }),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    );

    return {
        streams: data?.streams || [],
        pagination: data?.pagination || null,
        isLoading,
        isValidating,
        isError: !!error,
        error,
        mutate,
    };
}
