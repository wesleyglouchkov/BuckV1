export interface MultipartUploadOptions {
    filename: string;
    contentType: string;
    streamId: string;
    onProgress?: (progress: number) => void;
}

export async function uploadFileMultipart(file: File | Blob, options: MultipartUploadOptions) {
    const { filename, contentType, streamId, onProgress } = options;
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB min for S3 multipart
    const totalSize = file.size;

    // 1. Init Upload
    const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, contentType, streamId }),
    });

    if (!initRes.ok) throw new Error("Failed to initiate upload");
    const { uploadId, key } = await initRes.json();

    const parts: { ETag: string; PartNumber: number }[] = [];
    const totalParts = Math.ceil(totalSize / CHUNK_SIZE);
    let uploadedBytes = 0;

    // 2. Upload Parts
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        const chunk = file.slice(start, end);

        // Get Signed URL
        const signRes = await fetch("/api/upload/sign-part", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uploadId, key, partNumber }),
        });

        if (!signRes.ok) throw new Error(`Failed to sign part ${partNumber}`);
        const { url } = await signRes.json();

        // Direct PUT to S3
        const uploadRes = await fetch(url, {
            method: "PUT",
            body: chunk,
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload part ${partNumber}`);

        // ETag is essential for completion
        // Note: S3 exposes ETag in headers, but CORS must allow it.
        const etag = uploadRes.headers.get("ETag")?.replace(/"/g, ""); // Remove quotes
        if (!etag) throw new Error(`No ETag for part ${partNumber}. Check S3 CORS ExposeHeaders.`);

        parts.push({ PartNumber: partNumber, ETag: etag });

        uploadedBytes += chunk.size;
        if (onProgress) {
            onProgress(Math.round((uploadedBytes / totalSize) * 100));
        }
    }

    // 3. Complete Upload
    const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key, parts }),
    });

    if (!completeRes.ok) throw new Error("Failed to complete upload");

    return await completeRes.json();
}
