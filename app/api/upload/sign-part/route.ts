import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMultipartUploadPartUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { uploadId, key, partNumber } = body;

        if (!uploadId || !key || !partNumber) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const url = await getMultipartUploadPartUrl(key, uploadId, parseInt(partNumber));

        return NextResponse.json({ url });

    } catch (error) {
        console.error("Error signing upload part:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
