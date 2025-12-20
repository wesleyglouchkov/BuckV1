import { createClientAuthInstance, axiosInstance } from "@/utils/axios";

// Stream services for public viewers

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

};
