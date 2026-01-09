import { createClientAuthInstance, axiosInstance } from "@/utils/axios";

export const streamService = {

    // Get Stream Details (Public)
    getStreamDetails: async (streamId: string) => {
        try {
            // Use public instance for stream details
            const response = await axiosInstance.get(`/streams/${streamId}`);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || 'Failed to get stream details');
        }
    },

    // Get Viewer Token (Auth or Public/Guest)
    getViewerToken: async (streamId: string, userId: string, role: 'publisher' | 'subscriber') => {
        try {
            let axios;
            // If it's a guest ID (generated in frontend), use public instance
            if (userId.startsWith('guest-')) {
                axios = axiosInstance;
            } else {
                // Otherwise try to use authenticated instance
                axios = await createClientAuthInstance('MEMBER');
            }

            const response = await axios.get(`/streams/${streamId}/token`, {
                params: { userId, role }
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || 'Failed to get viewer token');
        }
    },

    // ----------------------Chat Implementation----------------------
    getChatMessages: async (streamId: string) => {
        try {
            // Public read access for chat
            const response = await axiosInstance.get(`/streams/${streamId}/chat`);
            return response.data;
        } catch (error: unknown) {
            console.error("Failed to get chat messages", error);
            // Return empty structure on fail so UI doesn't crash
            return { success: false, messages: [] };
        }
    },

    sendChatMessage: async (streamId: string, message: string) => {
        try {
            const axios = await createClientAuthInstance('MEMBER');
            const response = await axios.post(`/streams/${streamId}/chat`, { message });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Failed to send message", err);
            throw new Error(err.response?.data?.message || 'Failed to send message');
        }
    },

    // This run every 1 minute to update viewer count
    updateStreamStats: async (streamId: string, viewerCount: number) => {
        try {
            const axios = await createClientAuthInstance('CREATOR');
            const response = await axios.post(`/streams/${streamId}/stats`, { viewerCount });
            return response.data;
        } catch (error) {
            console.error("Failed to update stats", error);
            return { success: false };
        }
    },

    // Report Content (Message or Stream)
    reportContent: async (data: {
        senderId: string;
        reporterId: string;
        reporterComment: string;
        livestreamId: string;
        flaggedMsgId?: string;
    }) => {
        try {
            const axios = await createClientAuthInstance('MEMBER');
            const response = await axios.post('/users/moderation/report', data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Failed to report content", err);
            throw new Error(err.response?.data?.message || 'Failed to report content');
        }
    },

    // Get Explore Data (Public)
    getExploreData: async () => {
        try {
            const response = await axiosInstance.get('/streams/explore');
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || 'Failed to get explore data');
        }
    },

    // Buck Search (Public) - New Tabbed/Paginated API
    buckSearch: async (params: {
        tab: string;
        query?: string;
        page?: number;
        limit?: number;
        workoutType?: string;
        isLive?: boolean;
    }) => {
        try {
            const response = await axiosInstance.get('/streams/buck-search', {
                params
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || 'Failed to perform buck search');
        }
    }
};
