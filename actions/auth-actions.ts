"use server";

import axios from "axios";
import { getTokenCustom, getUserRole } from "@/actions";

// Create server-side authenticated axios instance
const createServerAuthInstance = async () => {
    try {
        const token = await getTokenCustom();
        const role = await getUserRole();
        
        return axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
            headers: {
                Authorization: `Bearer ${token}`,
                'role': role,
                'Content-Type': 'application/json'
            },
        });
    } catch (error) {
        console.error('Error creating server auth instance:', error);
        throw error;
    }
};

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const authAxios = await createServerAuthInstance();
    const response = await authAxios.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Password change failed' };
  }
}

export async function logoutAction() {
  try {
    const authAxios = await createServerAuthInstance();
    const response = await authAxios.post('/auth/logout');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Logout failed' };
  }
}
