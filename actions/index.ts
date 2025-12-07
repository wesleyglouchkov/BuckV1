import { cookies } from "next/headers";
import { auth } from "@/auth";

export const getTokenCustom = async () => {
    const cookieStore = await cookies();
    const cookiesOfNextAuth = cookieStore.get(process.env.JWT_SECRET as string)
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    return cookiesOfNextAuth?.value!
}

export const getUserRole = async () => {
    const session = await auth();
    return session?.user?.role || 'member';
}
