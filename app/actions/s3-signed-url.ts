"use server";

import { getS3Url } from "@/lib/s3";

export async function getSignedStreamUrl(path: string | null) {
    if (!path) return null;

    // Check if it's already a full URL (http/https)
    if (path.startsWith('http')) {
        return path;
    }

    try {
        const signedUrl = await getS3Url(path);
        return signedUrl;
    } catch (error) {
        console.error("Error signing S3 URL:", error);
        return null;
    }
}
