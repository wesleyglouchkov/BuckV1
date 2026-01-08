"use server";

import { deleteS3Object, getS3Url, deleteS3Folder } from "@/lib/s3/s3";

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

export async function deleteS3File(path: string | null) {
    if (!path) return;

    // If it's a full URL, we need to extract the key
    let key = path;
    if (path.startsWith('http')) {
        try {
            const url = new URL(path);
            // Assuming the key is the pathname after the bucket part
            // Often it's just the pathname without the leading slash
            key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;

            // If the bucket name is in the path (path-style), we might need more logic
            // But usually for Wesley/BuckV1 it seems to be virtual hosted style or direct keys
        } catch (e) {
            console.error("Failed to parse URL for S3 deletion:", e);
            return;
        }
    }

    try {
        await deleteS3Object(key);
        return { success: true };
    } catch (error) {
        console.error("Error deleting S3 object:", error);
        throw new Error("Failed to delete file from S3");
    }
}

export async function deleteS3FolderAction(prefix: string | null) {
    if (!prefix) return;

    try {
        await deleteS3Folder(prefix);
        return { success: true };
    } catch (error) {
        console.error("Error deleting S3 folder:", error);
        throw new Error("Failed to delete folder from S3");
    }
}
