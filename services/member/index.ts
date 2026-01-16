import { createClientAuthInstance } from "@/utils/axios";

// Member services
// Add your member-related API calls and business logic here

export const memberService = {
  //==================================== Member to Creator Upgrade  ====================================

  // Upgrade member to creator
  upgradeToCreator: async (userId: string, userRole?: string) => {
    try {
      const authInstance = await createClientAuthInstance(userRole);
      const response = await authInstance.post('/users/change-role', { userId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upgrade to creator');
    }
  },

  //==================================== My Creators APIs ====================================

  // Get Following List with pagination and search
  getMyFollowing: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const axios = await createClientAuthInstance('member');
      const response = await axios.get('/member/my-creators/following', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch following list');
    }
  },

  // Get Subscriptions List with pagination and search
  getMySubscriptions: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const axios = await createClientAuthInstance('member');
      const response = await axios.get('/member/my-creators/subscriptions', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions list');
    }
  },

  // Unfollow a creator
  unfollowCreator: async (followId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.delete(`/member/my-creators/following/${followId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unfollow creator');
    }
  },

  // Unsubscribe from a creator (uses existing endpoint)
  unsubscribeFromCreator: async (subscriptionId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.delete(`/member/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe');
    }
  },

  //==================================== Follow/Unfollow APIs ====================================

  // Follow a creator
  followCreatorById: async (creatorId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.post('/member/follow', { creatorId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to follow creator');
    }
  },

  // Check member's relationship with a creator (follow + subscription status)
  getCreatorRelationship: async (creatorId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.get(`/member/relationship/${creatorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check relationship status');
    }
  },

  // Unfollow a creator by creator ID
  unfollowCreatorById: async (creatorId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.delete(`/member/follow/${creatorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unfollow creator');
    }
  },

  // Tip Payment - Create Checkout Session
  createTipPayment: async (data: {
    creatorId: string;
    amount: number;
    livestreamId?: string;
    memberId: string;
  }) => {
    try {
      const axios = await createClientAuthInstance('member');
      // Fix: Endpoint is mounted under /api/member/stripe...
      const response = await axios.post('/member/stripe/create-tip-payment', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create tip payment');
    }
  },

  // Create Subscription Checkout Session
  subscribeToCreator: async (data: { creatorId: string; memberId: string }) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.post('/member/subscriptions/checkout', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate subscription');
    }
  },

  // Cancel Subscription (replaces unsubscribeFromCreator mostly, but we can keep both or alias)
  cancelSubscription: async (subscriptionId: string) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.delete(`/member/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
};
