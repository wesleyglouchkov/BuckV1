import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Path } from "./s3-constants";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function getS3Url(subpath: S3Path, filename: string) {
    const key = `${subpath}/${filename}`;
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 7200 }); // 2 hours
}

export async function getUploadUrl(subpath: S3Path, filename: string, contentType: string) {
    const key = `${subpath}/${filename}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes for upload start
}

export async function uploadToS3(subpath: S3Path, file: File | Blob, filename: string) {
    const key = `${subpath}/${filename}`;
    // Note: This function is intended for server-side usage or client-side if polyfills are present, 
    // but typically 'File' is a browser type. 
    // For server-side, you'd usually use Buffer. 
    // Given the request context, providing a direct put helper:

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    return await s3Client.send(command);
}
