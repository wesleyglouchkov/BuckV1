"use server";
import axios from "axios";

// Agora Configuration
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID!;
const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET!;
const BASE_URL = "https://api.sd-rtn.com";

// Helper to generate Basic Auth Header
const getAuthHeader = () => {
    if (!CUSTOMER_ID || !CUSTOMER_SECRET) {
        throw new Error("Missing Agora Customer ID or Secret in environment variables");
    }
    const credentials = `${CUSTOMER_ID}:${CUSTOMER_SECRET}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
};

// Types based on Cloud_RECORDING.md
interface AcquireResponse {
    cname: string;
    uid: string;
    resourceId: string;
}

interface StartResponse {
    cname: string;
    uid: string;
    resourceId: string;
    sid: string;
}

interface StopResponse {
    resourceId: string;
    sid: string;
    serverResponse: any;
}

/**
 * Step 1: Acquire a resource ID
 */
export async function acquire(cname: string, uid: string, clientRequest: any = { scene: 0, resourceExpiredHour: 72 }): Promise<AcquireResponse> {
    const url = `${BASE_URL}/v1/apps/${APP_ID}/cloud_recording/acquire`;

    const body = {
        cname,
        uid,
        clientRequest,
    };

    const response = await axios.post(url, body, {
        headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
        },
    });

    return response.data;
}

/**
 * Step 2: Start recording (Composite Mode)
 */
export async function start(resourceId: string, cname: string, uid: string, token: string, storageConfig: any): Promise<StartResponse> {
    const mode = "mix"; // Options: "individual", "mix" (composite), "web"
    const url = `${BASE_URL}/v1/apps/${APP_ID}/cloud_recording/resourceid/${resourceId}/mode/${mode}/start`;

    const body = {
        cname,
        uid,
        clientRequest: {
            token,
            recordingConfig: {   // Docs: https://docs.agora.io/en/cloud-recording/reference/restful-api#recordingconfig
                channelType: 1, // 0: Communication, 1: Live Broadcast
                streamTypes: 2, // Audio + Video
                videoStreamType: 0, // High quality
                maxIdleTime: 30, // Stop if idle for 30s
                transcodingConfig: {
                    width: 1280,
                    height: 720,
                    fps: 30,
                    bitrate: 2260,
                    mixedVideoLayout: 1, // 1: Best Fit
                    backgroundColor: "#000000",
                },
            },
            recordingFileConfig: {
                avFileType: ["hls", "mp4"], // Agora requires HLS to be enabled to generate MP4s in Composite Mode
            },
            storageConfig, // Uses the Vendor config provided
        },
    };

    const response = await axios.post(url, body, {
        headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
        },
    });

    return response.data;
}

/**
 * Stop recording
 */
export async function stop(resourceId: string, sid: string, cname: string, uid: string): Promise<StopResponse> {
    const mode = "mix"; // Options: "individual", "mix" (composite), "web"
    const url = `${BASE_URL}/v1/apps/${APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/${mode}/stop`;

    const body = {
        cname,
        uid,
        clientRequest: {
            async_stop: false,
        },
    };

    const response = await axios.post(url, body, {
        headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
        },
    });

    return response.data;
}

/**
 * Query status
 */
export async function query(resourceId: string, sid: string) {
    // Implementation if needed
}
