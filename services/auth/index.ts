import { axiosInstance } from "@/utils/axios";
import { changePasswordAction, logoutAction } from "@/actions/auth-actions";

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

  signup: async (userData: { name: string; username: string; email: string; password: string;}) => {
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

  changePassword: async (currentPassword: string, newPassword: string) => {
    const result = await changePasswordAction(currentPassword, newPassword);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-email', { token });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
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

  logout: async () => {
    const result = await logoutAction();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },
};
