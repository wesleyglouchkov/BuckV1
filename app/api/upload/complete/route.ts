import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { completeMultipartUpload } from "@/lib/s3";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { uploadId, key, parts } = body;

        // parts should be an array of { ETag, PartNumber }
        if (!uploadId || !key || !Array.isArray(parts)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Sort parts by PartNumber just in case
        const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

        const result = await completeMultipartUpload(key, uploadId, sortedParts);

        return NextResponse.json({
            success: true,
            location: result.Location,
            key: result.Key,
        });

    } catch (error) {
        console.error("Error completing multipart upload:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
