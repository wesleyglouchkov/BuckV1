import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as agoraRecordingClient from "@/lib/agora-recording-client";
import { deleteS3ObjectTagging } from "@/lib/s3";
import { S3_PATHS } from "@/lib/s3-constants";

export async function POST(req: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

        const { streamId } = await params;
        const body = await req.json();
        const { resourceId, sid, uid } = body;

        if (!resourceId || !sid || !uid) {
            return new NextResponse("Missing recording fields (resourceId, sid, uid)", { status: 400 });
        }

        const cname = streamId;

        // Stop Recording
        const result = await agoraRecordingClient.stop(resourceId, sid, cname, uid);

        let finalRecordingKey: string | null = null;
        // console.log("Stop Recording result:", result);
        // Remove "lifecycle=temp" tag from the MP4 file so it is NOT deleted by S3 Lifecycle Rule
        const fileList = result.serverResponse?.fileList;
        if (Array.isArray(fileList)) {
            const mp4File = fileList.find((f: any) => f.fileName?.endsWith(".mp4"));
            if (mp4File) {
                // Agora returns the full path in fileName
                const mp4Key = mp4File.fileName;
                try {
                    await deleteS3ObjectTagging(mp4Key);
                    finalRecordingKey = mp4Key;
                    // console.log("Preserved MP4 recording:", mp4Key);
                } catch (tagError) {
                    console.error("Failed to remove tag from MP4:", tagError);
                }
            }
        }
        return NextResponse.json({
            success: true,
            result,
            recordingKey: finalRecordingKey,
        });

    } catch (error: any) {
        console.error("Error stopping cloud recording:", error?.response?.data || error);
        return new NextResponse(JSON.stringify({ error: "Failed to stop recording", details: error?.response?.data }), { status: 500 });
    }
}
