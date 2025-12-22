import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Session } from "next-auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a viewer is logged in based on their session
 * @param session - The next-auth session object
 * @returns true if the user is logged in, false otherwise
 */
export function isViewerLoggedIn(session: Session | null): boolean {
  return session !== null && session.user !== undefined
}
