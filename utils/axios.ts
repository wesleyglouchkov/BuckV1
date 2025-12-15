import { getCookieTokenAction } from "@/actions";
import axios from "axios";

// Axios instance without authentication - for public endpoints
export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
    withCredentials: true, // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Client-side authenticated axios instance (uses session)
export const createClientAuthInstance = async ( role?: string) => {
    const token =  await getCookieTokenAction()
    return axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
        withCredentials: true, // Always include cookies for authentication
        headers: {
            ...(role && { 'role': role }),
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
};
