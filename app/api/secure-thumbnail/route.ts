import { NextRequest, NextResponse } from "next/server";
import { getS3Url } from "@/lib/s3/s3";
import { verify } from "jsonwebtoken";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // 2. Fetch Metadata Security (Strict)
    const fetchDest = request.headers.get("sec-fetch-dest");
    const fetchMode = request.headers.get("sec-fetch-mode");
    const referer = request.headers.get("referer");

    // Block non-browser tools (Postman/Curl) - they don't send fetch metadata
    if (!fetchDest || !fetchMode) {
        return new NextResponse("Direct access forbidden", { status: 403 });
    }

    // Block direct tab opening / navigation
    if (fetchDest === "document" || fetchMode === "navigate") {
        return new NextResponse("Direct access forbidden", { status: 403 });
    }

    // 3. Referer Check (Mandatory Anti-Leeching)
    // Ensures the link MUST be called from within our app.
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    if (!referer || !referer.startsWith(baseUrl)) {
        return new NextResponse("Invalid or missing referer", { status: 403 });
    }

    if (!token) {
        return new NextResponse("Missing token", { status: 400 });
    }

    let key = "";

    try {
        const secret = process.env.THUMBNAIL_SECRET;
        if (!secret) {
            return new NextResponse("Server configuration error", { status: 500 });
        }

        const decoded = verify(token, secret) as { path: string; ua: string };
        key = decoded.path;

        // 4. User-Agent Pinning Verification
        // If the token was generated for a different browser, block it.
        const currentUA = request.headers.get("user-agent")?.substring(0, 50) || 'unknown';
        if (decoded.ua !== currentUA) {
            console.warn("Token User-Agent mismatch. Possible token theft.");
            return new NextResponse("Security violation: Token-Browser mismatch", { status: 403 });
        }

    } catch (e) {
        console.error("Invalid token:", e);
        return new NextResponse("Invalid or expired token", { status: 401 });
    }

    // Clean up the key if it's a full URL
    if (key.startsWith('http')) {
        try {
            const url = new URL(key);
            key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        } catch (e) {
            console.error("Invalid URL format in token:", e);
            return new NextResponse("Invalid path in token", { status: 400 });
        }
    }

    try {
        // Redirection to S3 for scalability
        const signedUrl = await getS3Url(key, 300); // 5 minutes expiration
        return NextResponse.redirect(signedUrl);
    } catch (error: any) {
        console.error("Error redirecting to secure preview:", error);
        return new NextResponse("Failed to load preview", { status: 500 });
    }
}
