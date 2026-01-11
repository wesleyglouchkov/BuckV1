import useSWR from 'swr';
import { memberService } from '@/services/member';

// Types
interface Creator {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    bio?: string | null;
}

interface FollowingItem {
    id: string;
    creator: Creator;
    followedAt: string;
    status: string;
}

interface SubscriptionItem {
    id: string;
    creator: Creator;
    subscribedAt: string;
    renewalDate: string | null;
    status: string;
    amount: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface FollowingResponse {
    success: boolean;
    data: FollowingItem[];
    pagination: Pagination;
}

interface SubscriptionsResponse {
    success: boolean;
    data: SubscriptionItem[];
    pagination: Pagination;
}

// --- Hook: Fetch My Following List ---
export function useMyFollowing(params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search = '' } = params;

    const { data, error, isLoading, mutate } = useSWR<FollowingResponse>(
        ['my-following', page, limit, search],
        () => memberService.getMyFollowing({ page, limit, search }),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    return {
        following: data?.data || [],
        pagination: data?.pagination || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}

// --- Hook: Fetch My Subscriptions List ---
export function useMySubscriptions(params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search = '' } = params;

    const { data, error, isLoading, mutate } = useSWR<SubscriptionsResponse>(
        ['my-subscriptions', page, limit, search],
        () => memberService.getMySubscriptions({ page, limit, search }),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    return {
        subscriptions: data?.data || [],
        pagination: data?.pagination || null,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}
