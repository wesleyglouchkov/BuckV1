'use server';

import { cookies } from "next/headers";
import { auth } from "@/auth";


export const getUserRole = async () => {
    const session = await auth();
    return session?.user?.role || 'member';
}


export const getCookieTokenAction = async () => {
    const cookieStore = await cookies()
    const cookiesOfNextAuth = cookieStore.get(process.env.JWT_SALT as string)
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    return cookiesOfNextAuth?.value!
}