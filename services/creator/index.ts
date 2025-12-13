import { createClientAuthInstance } from "@/utils/axios";

// Creator services

export const creatorService = {
  // Stripe Connect - Create Account Link
  createStripeAccountLink: async (userId: string) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.post('/creator/stripe/connect/create-account-link', {
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
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.post('/creator/stripe/connect/disconnect', {
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
      const response = await axios.get(`/creator/stripe/connect/status/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Stripe account status');
    }
  },

  // Get User Profile
  getUserProfile: async (role: string) => {
    try {
      const axios = await createClientAuthInstance(role);
      const response = await axios.get('/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  // Update Profile
  updateProfile: async (role: string, data: UpdateProfileData) => {
    try {
      const axios = await createClientAuthInstance(role);
      const response = await axios.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
  },
};

export interface UpdateProfileData {
  bio?: string;
  subscriptionPrice?: number;
  avatar?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  stripe_account_id: string;
  stripe_connected: boolean;
  stripe_onboarding_completed: boolean;
  email: string;
  bio: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  isWarnedTimes: number;
  subscriptionPrice: number | null;
  _count: {
    followers: number;
    subscribers: number;
    createdStreams: number;
    subscriptions?: number;
    following?: number;
  };
}
