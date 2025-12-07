'use server';

import { cookies } from "next/headers";
import { auth } from "@/auth";


export const getUserRole = async () => {
    const session = await auth();
    return session?.user?.role || 'member';
}
