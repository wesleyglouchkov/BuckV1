export const S3_PATHS = {
    AVATARS: 'avatars',
    THUMBNAILS: 'thumbnails',
    VIDEOS: 'videos',
    DOCUMENTS: 'documents',
    STREAMS: 'streams',
    CREATORS: 'creators',
    USERS: 'users',
} as const;

export type S3Path = typeof S3_PATHS[keyof typeof S3_PATHS];

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
    PROFILE_IMAGE: 5 * 1024 * 1024, // 5MB
    THUMBNAIL: 10 * 1024 * 1024, // 10MB
    VIDEO: 500 * 1024 * 1024, // 500MB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
} as const;

// Allowed file types for different upload categories
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate file
export const validateFile = (
    file: File,
    allowedTypes: readonly string[],
    maxSize: number
): { valid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
    }
    if (file.size > maxSize) {
        return { valid: false, error: `File too large. Maximum size: ${formatFileSize(maxSize)}` };
    }
    return { valid: true };
};
