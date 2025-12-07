import { createClientAuthInstance } from "@/utils/axios";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  role: string;
  isActive: boolean;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
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
  role?: string;
  createdAt: string;
}

export interface RecentSignups {
  count: number;
  users: RecentSignupUser[];
}

export interface TopCreator {
  id: string;
  name: string;
  username: string;
  rank: number;
  followers: number;
  revenue: number;
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

export const adminService = {
  getUsers: async (params: GetUsersParams): Promise<GetUsersResponse> => {
    try {
      const axios = await createClientAuthInstance('admin');
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
      const axios = await createClientAuthInstance('admin');
      const response = await axios.patch(`/admin/user/${userId}`, options);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user options');
    }
  },

  getDashboard: async (): Promise<GetDashboardResponse> => {
    try {
      const axios = await createClientAuthInstance('admin');
      const response = await axios.get('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
};
