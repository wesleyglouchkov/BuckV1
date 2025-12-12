import { createClientAuthInstance } from "@/utils/axios";

// Member services
// Add your member-related API calls and business logic here

export const memberService = {
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

  // Tip Payment - Create Checkout Session
  createTipPayment: async (data: {
    creatorId: string;
    amount: number;
    livestreamId?: string;
    memberId: string;
  }) => {
    try {
      const axios = await createClientAuthInstance('member');
      const response = await axios.post('/stripe/create-tip-payment', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create tip payment');
    }
  },

  // Example: Profile management
  // getProfile: async () => { ... },
  // updateProfile: async (data: any) => { ... },

  // Example: Content consumption
  // getExploreContent: async () => { ... },
  // getSubscriptions: async () => { ... },
};
