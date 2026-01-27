"use server";

import { deleteS3Object, getS3Url, deleteS3Folder, getUploadUrl, uploadToS3 } from "@/lib/s3/s3";
import { S3_PATHS, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from "@/lib/constants/s3-constants";
import { auth } from "@/auth";

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

/**
 * Get a presigned URL for uploading a profile image
 * Path format: users/{user_id}/profile/{filename}
 */
export async function getProfileImageUploadUrl(
    fileName: string,
    contentType: string,
    fileSize: number
): Promise<{ success: boolean; uploadUrl?: string; key?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.IMAGE.includes(contentType as typeof ALLOWED_FILE_TYPES.IMAGE[number])) {
            return {
                success: false,
                error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.IMAGE.join(', ')}`
            };
        }

        // Validate file size
        if (fileSize > FILE_SIZE_LIMITS.PROFILE_IMAGE) {
            return {
                success: false,
                error: `File too large. Maximum size: ${FILE_SIZE_LIMITS.PROFILE_IMAGE / (1024 * 1024)}MB`
            };
        }

        const userId = session.user.id;
        const ext = fileName.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const cleanFileName = `profile_${timestamp}.${ext}`;

        // Path format: users/{user_id}/profile/{filename}
        const key = `${S3_PATHS.USERS}/${userId}/profile/${cleanFileName}`;

        const uploadUrl = await getUploadUrl(key, contentType);

        return { success: true, uploadUrl, key };
    } catch (error) {
        console.error("Error getting profile image upload URL:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}

/**
 * Get a signed URL for viewing a profile image
 */
export async function getProfileImageUrl(key: string | null): Promise<string | null> {
    if (!key) return null;

    // If it's already a full URL, return it
    if (key.startsWith('http')) {
        return key;
    }

    try {
        return await getS3Url(key);
    } catch (error) {
        console.error("Error getting profile image URL:", error);
        return null;
    }
}

/**
 * Delete old profile image when uploading a new one
 */
export async function deleteOldProfileImage(oldKey: string | null): Promise<{ success: boolean; error?: string }> {
    if (!oldKey) return { success: true };

    // Don't delete external URLs
    if (oldKey.startsWith('http')) {
        return { success: true };
    }

    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify the key belongs to this user
        const userPrefix = `${S3_PATHS.USERS}/${session.user.id}/profile/`;
        if (!oldKey.startsWith(userPrefix)) {
            return { success: false, error: "Unauthorized to delete this file" };
        }

        await deleteS3Object(oldKey);
        return { success: true };
    } catch (error) {
        console.error("Error deleting old profile image:", error);
        return { success: false, error: "Failed to delete old profile image" };
    }
}

/**
 * Get a presigned URL for uploading a support request image
 * Path format: support/email/image_{timestamp}.{ext}
 */
export async function getSupportImageUploadUrl(
    fileName: string,
    contentType: string,
    fileSize: number
): Promise<{ success: boolean; uploadUrl?: string; key?: string; error?: string }> {
    try {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.IMAGE.includes(contentType as typeof ALLOWED_FILE_TYPES.IMAGE[number])) {
            return {
                success: false,
                error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.IMAGE.join(', ')}`
            };
        }

        // Validate file size
        if (fileSize > FILE_SIZE_LIMITS.SUPPORT_IMAGE) {
            return {
                success: false,
                error: `File too large. Maximum size: ${FILE_SIZE_LIMITS.SUPPORT_IMAGE / (1024 * 1024)}MB`
            };
        }

        const ext = fileName.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const cleanFileName = `image_${timestamp}.${ext}`;

        // Path format: support/email/image_{timestamp}.{ext}
        const key = `${S3_PATHS.SUPPORT}/${cleanFileName}`;

        const uploadUrl = await getUploadUrl(key, contentType);

        return { success: true, uploadUrl, key };
    } catch (error) {
        console.error("Error getting support image upload URL:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}
