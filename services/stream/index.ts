import { createClientAuthInstance } from "@/utils/axios";

// Stream services for public viewers

export const streamService = {
    // Get Stream Details
    getStreamDetails: async (streamId: string) => {
        try {
            const axios = await createClientAuthInstance('MEMBER');
            const response = await axios.get(`/streams/${streamId}`);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || 'Failed to get stream details');
        }
    },

    // Get Viewer Token
    getViewerToken: async (streamId: string, userId: string, role: 'publisher' | 'subscriber') => {
        try {
            const axios = await createClientAuthInstance('MEMBER');
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
