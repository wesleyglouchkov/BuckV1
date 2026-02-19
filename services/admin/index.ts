import { createClientAuthInstance } from "@/utils/axios";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  role: string;
  isActive: boolean;
  subscriptionPrice: number | null;
  stripeConnected: boolean;
  stripeOnboardingCompleted: boolean;
  warningCount: number;
  // Creator-specific fields
  followers?: number;
  subscriberCount?: number;
  totalStreams?: number;
  revenue?: number;
  // Member-specific fields
  following?: number;
  subscriptions?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: {
    items: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface GetUsersParams {
  page: number;
  limit: number;
  type: 'creator' | 'member';
  search?: string;
  isActive?: boolean;
}

export interface DashboardStats {
  title: string;
  value: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface RecentSignupUser {
  id: string;
  name: string;
  email?: string;
  username: string;
  role?: string;
  createdAt: string;
  bio: string | null;
  avatar: string | null;
}

export interface RecentSignups {
  count: number;
  users: RecentSignupUser[];
}

export interface TopCreator {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  subscriptionPrice: number | null;
  stripeConnected: boolean;
  stripeOnboardingCompleted: boolean;
  warningCount: number;
  joinedAt: string;
  followers: number;
  subscriberCount: number;
  totalStreams: number;
  revenue: number;
  rank: number;
}

export interface DashboardData {
  stats: DashboardStats[];
  chart: {
    creators: ChartDataPoint[];
    members: ChartDataPoint[];
  };
  recentSignups: RecentSignups;
  topCreators: TopCreator[];
}

export interface GetDashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string | null;
  avatar: string | null;
  isActive: boolean;
  warningCount: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    content: number;
  };
  stats: {
    totalRevenue: number;
    followers: number;
    avgEngagement: string;
  };
}

export interface GetCreatorProfileResponse {
  success: boolean;
  data: CreatorProfile;
}

// Moderation interfaces
export interface FlaggedMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email: string;
    username: string;
    warningCount: number;
    role: 'CREATOR' | 'MEMBER';
  };
  timestamp: string;
  flagged: boolean;
  reporterComment: string;
  streamTitle: string;
}

export interface FlaggedContent {
  id: string;
  streamId: string;
  title: string;
  description: string;
  thumbnail: string;
  workoutType: string;
  streamUrl: string | null;
  isLive: boolean;
  startTime: string;
  endTime: string | null;
  creator: {
    id: string;
    name: string;
    email: string;
    username: string;
    warningCount: number;
  };
  flagged: boolean;
  reporterComment: string;
  createdAt: string;
}

export interface GetFlaggedMessagesParams {
  page?: number;
  limit?: number;
  search?: string;
  badWords?: string[];
}

export interface GetFlaggedContentParams {
  page?: number;
  limit?: number;
}

export interface GetFlaggedMessagesResponse {
  success: boolean;
  data: {
    messages: FlaggedMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetFlaggedContentResponse {
  success: boolean;
  data: {
    content: FlaggedContent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface IssueWarningParams {
  userId: string;
  warningMessage: string;
  violatingContent?: string; // The message/content that triggered the warning
}

export interface IssueWarningResponse {
  success: boolean;
  data: {
    id: string;
    isWarnedTimes: number;
  };
}

export const adminService = {

  // User Management
  getUsers: async (params: GetUsersParams): Promise<GetUsersResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.get('/admin/users', {
        params: {
          page: params.page,
          limit: params.limit,
          type: params.type,
          ...(params.search && { search: params.search.trim() }),
          ...(params.isActive !== undefined && { isActive: params.isActive }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  updateOptions: async (userId: string, options: { isActive?: boolean }) => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.patch(`/admin/user/${userId}`, options);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user options');
    }
  },

  // Dashboard
  getDashboard: async (): Promise<GetDashboardResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.get('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Creator Profile
  getCreatorProfile: async (creatorId: string): Promise<GetCreatorProfileResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.get(`/admin/get-creater-profile/${creatorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch creator profile');
    }
  },

  // Moderation methods
  getFlaggedMessages: async (params: GetFlaggedMessagesParams): Promise<GetFlaggedMessagesResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 10,
      };

      if (params.search) {
        queryParams.search = params.search;
      }

      if (params.badWords && params.badWords.length > 0) {
        queryParams.badWords = params.badWords.join(',');
      }

      const response = await axios.get('/admin/moderation/messages', {
        params: queryParams,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch flagged messages');
    }
  },

  getFlaggedContent: async (params: GetFlaggedContentParams): Promise<GetFlaggedContentResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.get('/admin/moderation/content', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch flagged content');
    }
  },

  issueWarning: async (params: IssueWarningParams): Promise<IssueWarningResponse> => {
    try {
      const axios = await createClientAuthInstance('ADMIN');
      const response = await axios.patch(`/admin/increment-warnings/${params.userId}`, {
        warningMessage: params.warningMessage,
        violatingContent: params.violatingContent,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to issue warning');
    }
  },
};
