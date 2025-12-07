import axios from "axios";

// Axios instance without authentication - for public endpoints
export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Client-side authenticated axios instance (uses session)
export const createClientAuthInstance = (token?: string, role?: string) => {
    return axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(role && { 'role': role }),
            'Content-Type': 'application/json'
        },
    });
};
