import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as agoraRecordingClient from "@/lib/agora/agora-recording-client";
import { RtcTokenBuilder, RtcRole } from "agora-token";

// Map AWS Region strings to Agora Region Ints
const AWS_REGION_MAP: Record<string, number> = {
    "us-east-1": 0,
    "us-east-2": 1,
    "us-west-1": 2,
    "us-west-2": 3,
    "eu-west-1": 4,
    "eu-west-2": 5,
    "eu-west-3": 6,
    "eu-central-1": 7,
    "ap-southeast-1": 8,
    "ap-southeast-2": 9,
    "ap-northeast-1": 10,
    "ap-northeast-2": 11,
    "sa-east-1": 12,
    "ca-central-1": 13,
    "ap-south-1": 14,
    "cn-north-1": 15,
    "cn-northwest-1": 16,
    "us-gov-west-1": 17,
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        // Note: Allowing authenticated creators to start recording. 
        // In production, verify the user OWNS the stream.

        const { streamId } = await params;
        const cname = streamId; // Using streamId as channel name

        // Generate a UID for the recorder (must be integer, unique in channel)
        // Using a fixed huge number or random. 
        // Better to handle collision, but for now:
        const uid = Math.floor(Math.random() * 1000000) + 1000000000 + ""; // e.g. 1000543210 (String for API)

        // 1. Acquire
        const acquireData = await agoraRecordingClient.acquire(cname, uid);
        const { resourceId } = acquireData;

        // 2. Prepare Storage Config
        const regionStr = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
        const agoraRegion = AWS_REGION_MAP[regionStr] || 0;

        // Agora "fileNamePrefix" is an array of folders.
        // Result: creators/{userId}/streams/{streamId}/...
        const fileNamePrefix = ["creators", session.user.id, "streams", cname];

        const storageConfig = {
            vendor: 1, // AWS S3. - Docs: https://docs.agora.io/en/cloud-recording/reference/restful-api#storageconfig
            region: agoraRegion,
            bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
            accessKey: process.env.AWS_ACCESS_KEY_ID,
            secretKey: process.env.AWS_SECRET_ACCESS_KEY,
            fileNamePrefix: fileNamePrefix,
            extensionParams: {
                sse: "aws:kms", // Required to use tagging feature in Agora
                tag: "lifecycle=temp"
            }
        };

        // Generate Recorder Token
        let token = "";
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (appId && appCertificate) {
            const expirationInSeconds = 3600;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpire = currentTimestamp + expirationInSeconds;

            // Import dynamically or assume it's available. 
            // Note: Since we are in an API route, we can import 'agora-token'.
            // However, to keep this self-contained securely without top-level import errors if package missing:

            token = RtcTokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                cname,
                parseInt(uid), // Recorder UID
                RtcRole.SUBSCRIBER, // Recorder subscribes to content
                privilegeExpire,
                privilegeExpire
            );
        }
        if (!token) {
            return new NextResponse("Failed to generate token", { status: 500 });
        }
        // 3. Start
        const startData = await agoraRecordingClient.start(resourceId, cname, uid, token, storageConfig);
        const { sid } = startData;

        // 4. Save to DB (Pseudo-code)
        // await db.stream.update({
        //   where: { id: streamId },
        //   data: { recordingId: resourceId, recordingSid: sid}
        // });

        return NextResponse.json({
            success: true,
            resourceId,
            sid,
            uid,
        });

    } catch (error: any) {
        console.error("Error starting cloud recording:", error?.response?.data || error);
        return new NextResponse(JSON.stringify({ error: "Failed to start recording", details: error?.response?.data }), { status: 500 });
    }
}
