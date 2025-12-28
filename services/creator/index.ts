import { createClientAuthInstance } from "@/utils/axios";


export interface CreateStreamData {
  title: string;
  workoutType?: string;
  startTime: string;
  timezone?: string;
  creatorId: string;
  isScheduled: boolean;
}

export interface UpdateStreamData {
  title?: string;
  workoutType?: string;
  startTime?: string;
  timezone?: string;
}

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


// Creator services

export const creatorService = {

  /*--------------------------------------Stripe Connect--------------------------------------*/

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

  /*--------------------------------------Profile Page--------------------------------------*/

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

  /*--------------------------------------Dashboard Page--------------------------------------*/

  // Get Dashboard Data
  getDashboardData: async () => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.get('/creator/dashboard');
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  /*--------------------------------------Creator Streaming /Live Page--------------------------------------*/

  // Create/Schedule Stream
  createStream: async (data: CreateStreamData) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.post('/creator/streams/create', data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to create stream');
    }
  },

  // Get Agora Token for Streaming
  getStreamToken: async (streamId: string, userId: string, role: 'publisher' | 'subscriber') => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.get(`/streams/${streamId}/token`, {
        params: { userId, role }
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to get stream token');
    }
  },

  // Change Live Status (Go Live / Stop Live)
  changeLiveStatus: async (streamId: string, data: { isLive: boolean }) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.patch(`/creator/streams/${streamId}/status`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to change live status');
    }
  },

  // Stop Stream
  stopStream: async (streamId: string, recordingKey?: string) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.post(`/creator/streams/${streamId}/stop`, { replayUrl: recordingKey });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to stop stream');
    }
  },



  /*--------------------------------------My Schedule--------------------------------------*/

  // Get Creator's My Scheduled Streams
  getScheduledStreamsOfTheCreator: async (creatorId: string) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.get(`/creator/${creatorId}/scheduled-streams`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to fetch scheduled streams');
    }
  },

  // Delete a Scheduled Stream
  deleteStream: async (streamId: string) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.delete(`/creator/streams/${streamId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to delete stream');
    }
  },

  // Update/Edit Stream Details
  updateStream: async (streamId: string, data: UpdateStreamData) => {
    try {
      const axios = await createClientAuthInstance('CREATOR');
      const response = await axios.put(`/creator/streams/${streamId}`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Failed to update stream');
    }
  },

};