import { getCookieTokenAction } from "@/actions";
import axios from "axios";

import { toast } from "sonner";

// Helper to add interceptors
const setupInterceptors = (instance: any) => {
    instance.interceptors.response.use(
        (response: any) => response,
        (error: any) => {
            if (error.response && error.response.status === 429) {
                if (typeof window !== 'undefined') {
                    toast.error("You are limited due to repeated requests. Please try again later.");
                }
            }
            return Promise.reject(error);
        }
    );
};

// Axios instance without authentication - for public endpoints
export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

setupInterceptors(axiosInstance);

// Client-side authenticated axios instance (uses session)
export const createClientAuthInstance = async (role?: string) => {
    const token = await getCookieTokenAction()
    const instance = axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
        withCredentials: true, // Always include cookies for authentication
        headers: {
            ...(role && { 'role': role }),
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    setupInterceptors(instance);

    return instance;
};
