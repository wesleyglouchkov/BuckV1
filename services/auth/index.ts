import { axiosInstance, createClientAuthInstance } from "@/utils/axios";

export const authService = {
  checkUsername: async (username: string) => {
    try {
      const response = await axiosInstance.get('/auth/check-username', {
        params: { username }
      });
      return { available: response.data.available };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Username check failed');
    }
  },

  signup: async (userData: { name: string; username: string; email: string; password: string; role?: 'CREATOR' | 'MEMBER' }) => {
    try {
      const response = await axiosInstance.post('/auth/signup', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },
  
  login: async (credentials: { emailOrUsername: string; password: string; }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  },

  verifyToken: async (token: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-token', { token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  changePassword: async (data: { oldPassword: string; newPassword: string; }, userRole?: string) => {
    try {
      const authInstance = await createClientAuthInstance(userRole);
      const response = await authInstance.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  // logout: async () => {
  //   const result = await logoutAction();
  //   if (!result.success) {
  //     throw new Error(result.error);
  //   }
  //   return result.data;
  // },
};
