import { S3Client, PutObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, DeleteObjectTaggingCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Path } from "./s3-constants";

// S3 Client
const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
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

// Remove tags from an S3 object
export async function deleteS3ObjectTagging(key: string) {
    const command = new DeleteObjectTaggingCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: key,
    });

    return await s3Client.send(command);
}

