import { getUploadUrl } from "@/lib/s3";
import { S3_PATHS } from "@/lib/s3-constants";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { streamId } = await params;
        const filename = req.nextUrl.searchParams.get("filename");

        if (!filename) {
            return NextResponse.json(
                { error: "Filename is required" },
                { status: 400 }
            );
        }

        // Generate the S3 key and pre-signed upload URL
        const key = `${S3_PATHS.STREAMS}/${streamId}/${filename}`;
        const uploadUrl = await getUploadUrl(S3_PATHS.STREAMS, `${streamId}/${filename}`, "video/webm");

        return NextResponse.json({
            uploadUrl,
            key,
        });
    } catch (error) {
        console.error("Error generating upload URL:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
