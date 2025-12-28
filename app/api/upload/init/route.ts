import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming auth helper is here or similar
import { createMultipartUpload } from "@/lib/s3";
import { S3_PATHS } from "@/lib/s3-constants";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { filename, contentType, streamId } = body;

        if (!filename || !contentType || !streamId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Generate a unique key for the file
        // Pattern: creators/{email}/streams/{streamId}-{timestamp}.{ext}
        const timestamp = Date.now();
        const ext = filename.split('.').pop();
        const cleanEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_'); // Safety sanitize
        // Using 'streams' folder inside creators directory as per plan, or explicit 'streams' folder?
        // Plan said: creators/{email}/streams/...
        const key = `${S3_PATHS.CREATORS}/${cleanEmail}/${S3_PATHS.STREAMS}/${streamId}-${timestamp}.${ext}`;

        const { UploadId } = await createMultipartUpload(key, contentType);

        if (!UploadId) {
            return new NextResponse("Failed to initiate upload", { status: 500 });
        }

        return NextResponse.json({
            uploadId: UploadId,
            key: key,
        });

    } catch (error) {
        console.error("Error initiating multipart upload:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
