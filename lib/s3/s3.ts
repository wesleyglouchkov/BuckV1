import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, DeleteObjectTaggingCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// S3 Client
const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

// Get S3 presigned URL to get file from S3
export async function getS3Url(subpath: string) {
    const key = `${subpath}`;
    const command = new GetObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 7200 }); // 2 hours
}

// Get S3 presigned upload URL
export async function getUploadUrl(subpath: string, contentType: string) {
    const key = `${subpath}`;
    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes for upload start
}

// Upload file to S3 with uploadUrl
export async function uploadToS3(subpath: string, file: File | Blob) {
    const key = `${subpath}`;
    // Note: This function is intended for server-side usage or client-side if polyfills are present, 
    // but typically 'File' is a browser type. 
    // For server-side, you'd usually use Buffer. 
    // Given the request context, providing a direct put helper:

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    return await s3Client.send(command);
}

// --- Multipart Upload Helpers (Server-Side Only) ---

// Create multipart upload
export async function createMultipartUpload(key: string, contentType: string) {
    const command = new CreateMultipartUploadCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await s3Client.send(command);
}

// Get multipart upload part URL
export async function getMultipartUploadPartUrl(key: string, uploadId: string, partNumber: number) {
    const command = new UploadPartCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes per part
}

export async function completeMultipartUpload(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
            Parts: parts,
        },
    });

    return await s3Client.send(command);
}

// Abort multipart upload
export async function abortMultipartUpload(key: string, uploadId: string) {
    const command = new AbortMultipartUploadCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
    });

    return await s3Client.send(command);
}

// Delete an object from S3
export async function deleteS3Object(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
    });

    return await s3Client.send(command);
}

// Delete a "folder" (prefix) from S3
export async function deleteS3Folder(prefix: string) {
    if (!prefix) return;

    // Ensure prefix ends with a slash to avoid accidental partial matches
    const folderPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

    // 1. List all objects with the prefix
    const listCommand = new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Prefix: folderPrefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    // 2. Prepare delete command
    const deleteParams = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Delete: {
            Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
        },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    return await s3Client.send(deleteCommand);
}

