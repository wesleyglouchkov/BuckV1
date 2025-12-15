export const S3_PATHS = {
    AVATARS: 'avatars',
    THUMBNAILS: 'thumbnails',
    VIDEOS: 'videos',
    DOCUMENTS: 'documents',
} as const;

export type S3Path = typeof S3_PATHS[keyof typeof S3_PATHS];
