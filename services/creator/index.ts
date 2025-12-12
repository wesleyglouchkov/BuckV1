import { createClientAuthInstance } from "@/utils/axios";

// Creator services
// Add your creator-related API calls and business logic here

export const creatorService = {
  // Stripe Connect - Create Account Link
  createStripeAccountLink: async (userId: string) => {
    try {
      const axios = await createClientAuthInstance('creator');
      const response = await axios.post('/stripe/connect/create-account-link', {
        userId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to connect Stripe account');
    }
  },

  // Stripe Connect - Disconnect Account
  disconnectStripeAccount: async (userId: string) => {
    try {
      const axios = await createClientAuthInstance('creator');
      const response = await axios.post('/stripe/connect/disconnect', {
        userId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to disconnect Stripe account');
    }
  },

  // Stripe Connect - Get Account Status
  getStripeAccountStatus: async (userId: string) => {
    try {
      const axios = await createClientAuthInstance('creator');
      const response = await axios.get(`/stripe/connect/status/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Stripe account status');
    }
  },

  // Example: Content management
  // getContent: async () => { ... },
  // createContent: async (data: any) => { ... },
  // updateContent: async (contentId: string, data: any) => { ... },
  // deleteContent: async (contentId: string) => { ... },

  // Example: Analytics
  // getAnalytics: async () => { ... },
};
