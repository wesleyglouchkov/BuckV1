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
  }
};
