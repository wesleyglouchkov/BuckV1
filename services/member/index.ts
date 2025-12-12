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

  // Example: Profile management
  // getProfile: async () => { ... },
  // updateProfile: async (data: any) => { ... },

  // Example: Content consumption
  // getExploreContent: async () => { ... },
  // getSubscriptions: async () => { ... },
};
