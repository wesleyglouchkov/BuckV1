import { axiosInstance } from "@/utils/axios";

export const userService = {
    submitHelpRequest: async (data: {
        name: string;
        email: string;
        phoneNumber?: string;
        country?: string;
        issue: string;
        imageUrl?: string;
    }) => {
        try {
            const response = await axiosInstance.post('/users/help-request', data);
            return response.data;
        } catch (error: any) {
            console.error("UserService submitHelpRequest error:", error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const message = error.response.data?.message || error.response.statusText || 'Server error occurred';
                throw new Error(message);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('No response from server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(error.message || 'Failed to create request');
            }
        }
    }
};
