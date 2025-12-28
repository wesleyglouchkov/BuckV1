import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as agoraRecordingClient from "@/lib/agora-recording-client";

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

        // Update DB
        // await db.stream.update({ where: { id: streamId }, data: { isLive: false, ... } });

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error: any) {
        console.error("Error stopping cloud recording:", error?.response?.data || error);
        return new NextResponse(JSON.stringify({ error: "Failed to stop recording", details: error?.response?.data }), { status: 500 });
    }
}
