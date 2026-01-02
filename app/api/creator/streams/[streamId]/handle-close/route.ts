import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import * as agoraRecordingClient from "@/lib/agora/agora-recording-client";
import { deleteS3ObjectTagging } from "@/lib/s3";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Handle browser close/unload for live streams.
 * This endpoint is called via navigator.sendBeacon when the user closes/refreshes the page while live.
 * It performs the same cleanup as handleStreamEnd:
 * 1. Stop cloud recording (if active)
 * 2. Stop the stream in the backend
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { streamId } = await params;

        // Get JWT token from cookies (same as getCookieTokenAction)
        const cookieStore = await cookies();
        const jwtCookie = cookieStore.get(process.env.JWT_SALT as string);
        const token = jwtCookie?.value;

        // Parse the beacon data
        let body: {
            isRecording?: boolean;
            recordingDetails?: { resourceId: string; sid: string; uid: string } | null
        } = {};

        try {
            const text = await req.text();
            if (text) {
                body = JSON.parse(text);
            }
        } catch {
            // If body parsing fails, continue with empty body
        }

        const { isRecording, recordingDetails } = body;
        let recordingKey: string | undefined = undefined;

        // Step 1: Stop Cloud Recording if active
        if (isRecording && recordingDetails?.resourceId && recordingDetails?.sid && recordingDetails?.uid) {
            try {
                const cname = streamId;
                const result = await agoraRecordingClient.stop(recordingDetails.resourceId, recordingDetails.sid, cname, recordingDetails.uid);

                // Remove "lifecycle=temp" tag from the MP4 file
                const fileList = result.serverResponse?.fileList;
                if (Array.isArray(fileList)) {
                    const mp4File = fileList.find((f: any) => f.fileName?.endsWith(".mp4"));
                    if (mp4File) {
                        const mp4Key = mp4File.fileName;
                        try {
                            await deleteS3ObjectTagging(mp4Key);
                            recordingKey = mp4Key;
                        } catch (tagError) {
                            console.error("Failed to remove tag from MP4:", tagError);
                        }
                    }
                }
            } 
            catch (recordingError) {
                console.error("Error stopping recording during handle-close:", recordingError);
                // Continue to stop the stream even if recording stop fails
            }
        }

        // Step 2: Stop the stream in the backend (using same auth as creatorService.stopStream)
        try {
            await fetch(`${BACKEND_URL}/api/creator/streams/${streamId}/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'role': 'CREATOR',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({ replayUrl: recordingKey }),
            });
        } catch (stopError) {
            console.error("Error stopping stream during handle-close:", stopError);
        }

        return NextResponse.json({ success: true, recordingKey });

    } catch (error: any) {
        console.error("Error in handle-close:", error);
        // Return success anyway for beacon calls - we can't recover from errors here
        return NextResponse.json({ success: false, error: error?.message });
    }
}
