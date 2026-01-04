# Frontend Implementation Plan: Live Streaming with Agora & Vidstack

## Overview
Integrate Agora ILS for live streaming with Vidstack player for replay, react-big-calendar for scheduling, and email notifications.

**Agora SDK Info:**
- **Product:** Interactive Live Streaming (ILS)
- **SDK:** Video SDK for React
- **Package:** `agora-rtc-react` v2.5.0 (Latest)
- **Note:** Since v2.0.0, `agora-rtc-sdk-ng` is included automatically - no need to install separately

### **What You Need for Agora:**

Only **3 things** are required (all can be handled on frontend):

1. **App ID** - From Agora Console (free to generate)
2. **Channel Name** - Unique string for the video session (user-provided)
3. **Token** - Required for production (generate via Agora token server or backend)

**Environment Variables:**
```env
NEXT_PUBLIC_AGORA_APP_ID=e7f6e9aeecf14b2ba10e3f40be9f56e7
```

That's it! No complex backend setup needed for basic live streaming.

### **Interactive Features:**

**Members can turn on cameras:**
- Members join with `publisher` role token
- Can enable camera/microphone to participate

**Creator moderation controls:**
- Block participants (using Agora SDK)
- Mute audio/video (using Agora SDK)
- All handled client-side - no backend needed

**Agora SDK Methods:**
```typescript
// Block a user
client.setClientRole('audience', { uid: blockedUserId });

// Mute remote user's audio
remoteUser.audioTrack?.setVolume(0);

// Mute remote user's video  
remoteUser.videoTrack?.stop();
```

---

## 1. Install Required Packages

```bash
# Agora SDK (includes agora-rtc-sdk-ng automatically)
npm install agora-rtc-react

# Video Player
npm install vidstack @vidstack/react

# Calendar
npm install react-big-calendar date-fns

# Utilities
npm install dayjs
```

---

## 2. Agora SDK Reference

### **Available Hooks:**

| Hook | Description |
|------|-------------|
| `useJoin` | Auto join channel on mount, leave on unmount |
| `usePublish` | Auto publish local tracks |
| `useRTCClient` | Get IAgoraRTCClient object |
| `useLocalCameraTrack` | Create local camera video track |
| `useLocalMicrophoneTrack` | Create local microphone audio track |
| `useLocalScreenTrack` | Create screen-sharing track |
| `useRemoteUsers` | Get list of remote users |
| `useRemoteUserTrack` | Get audio/video track of remote user |
| `useRemoteVideoTracks` | Auto subscribe to remote video tracks |
| `useRemoteAudioTracks` | Auto subscribe to remote audio tracks |
| `useCurrentUID` | Get current user ID |
| `useIsConnected` | Check if connected to Agora |
| `useConnectionState` | Get detailed connection state |
| `useNetworkQuality` | Get network quality |
| `useVolumeLevel` | Get audio volume level |
| `useAutoPlayVideoTrack` | Auto play video track |
| `useAutoPlayAudioTrack` | Auto play audio track |
| `useClientEvent` | Listen to client events |
| `useTrackEvent` | Listen to track events |

### **Available Components:**

| Component | Description |
|-----------|-------------|
| `AgoraRTCProvider` | Context provider for RTC client |
| `AgoraRTCScreenShareProvider` | Context provider for screen sharing |
| `LocalUser` | Play local camera + microphone |
| `LocalVideoTrack` | Play local video track |
| `LocalAudioTrack` | Play local audio track |
| `RemoteUser` | Play remote user's video + audio |
| `RemoteVideoTrack` | Play remote video track |
| `RemoteAudioTrack` | Play remote audio track |

---

## 3. Components to Create

### **A. AgoraLiveStream.tsx** (Creator's Live View with Preview & Recording)

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  AgoraRTCProvider,
  LocalUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { creatorService } from "@/services/creator";
import { toast } from "sonner";

interface AgoraLiveStreamProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  streamId: string;
  isLive: boolean; // Controls if actually streaming
  onStreamEnd: (replayUrl?: string) => void;
}

function LiveStreamContent({
  channelName,
  token,
  uid,
  streamId,
  isLive,
  onStreamEnd,
}: Omit<AgoraLiveStreamProps, "appId">) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const client = useRTCClient();
  
  // Create local tracks (always on for preview)
  const { localCameraTrack } = useLocalCameraTrack();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();

  // Only join and publish when going live
  useJoin(
    isLive
      ? {
          appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channel: channelName,
          token,
          uid,
        }
      : null // Don't join until live
  );

  // Only publish when live
  usePublish(isLive ? [localCameraTrack, localMicrophoneTrack] : []);

  // Start recording when going live
  useEffect(() => {
    if (isLive && !isRecording && localCameraTrack && localAudioTrack) {
      startRecording();
    }
  }, [isLive]);

  const startRecording = async () => {
    try {
      // Get media stream from tracks
      const videoStream = localCameraTrack?.getMediaStreamTrack();
      const audioStream = localMicrophoneTrack?.getMediaStreamTrack();
      
      if (!videoStream || !audioStream) return;

      const mediaStream = new MediaStream([videoStream, audioStream]);
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await uploadRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const uploadRecording = async () => {
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const filename = `${streamId}_${Date.now()}.webm`;

      // Get presigned URL from backend
      const { uploadUrl, key } = await creatorService.getS3UploadUrl(streamId, filename);

      // Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'video/webm',
        },
      });

      const replayUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
      
      console.log('Recording uploaded:', replayUrl);
      toast.success('Recording saved!');
      
      // Pass replay URL to parent
      onStreamEnd(replayUrl);
    } catch (error) {
      console.error('Failed to upload recording:', error);
      toast.error('Failed to save recording');
      onStreamEnd(); // End without replay URL
    }
  };

  const toggleVideo = async () => {
    if (localCameraTrack) {
      await localCameraTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const endStream = async () => {
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Leave channel
    await client.leave();
    localCameraTrack?.close();
    localMicrophoneTrack?.close();
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Local Video (always shown for preview) */}
      <LocalUser
        audioTrack={localMicrophoneTrack}
        videoTrack={localCameraTrack}
        cameraOn={isVideoEnabled}
        micOn={isAudioEnabled}
        playAudio={false} // Don't play own audio
        playVideo={true}
        className="w-full h-full"
      />

      {/* Controls (always visible) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>
        {isLive && (
          <Button onClick={endStream} variant="destructive">
            End Stream
          </Button>
        )}
      </div>

      {/* Live Indicator (only when live) */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10">
          ● Recording
        </div>
      )}
    </div>
  );
}

export default function AgoraLiveStream(props: AgoraLiveStreamProps) {
  const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <LiveStreamContent {...props} />
    </AgoraRTCProvider>
  );
}
```

---

```tsx
"use client";

import { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  AgoraRTCProvider,
  LocalUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface AgoraLiveStreamProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  onStreamEnd: () => void;
}

function LiveStreamContent({
  channelName,
  token,
  uid,
  onStreamEnd,
}: Omit<AgoraLiveStreamProps, "appId">) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const client = useRTCClient();
  
  // Create local tracks
  const { localCameraTrack } = useLocalCameraTrack();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();

  // Join channel
  useJoin({
    appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
    channel: channelName,
    token,
    uid,
  });

  // Publish tracks
  usePublish([localCameraTrack, localMicrophoneTrack]);

  const toggleVideo = async () => {
    if (localCameraTrack) {
      await localCameraTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const endStream = async () => {
    await client.leave();
    localCameraTrack?.close();
    localMicrophoneTrack?.close();
    onStreamEnd();
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Local Video */}
      <LocalUser
        audioTrack={localMicrophoneTrack}
        videoTrack={localCameraTrack}
        cameraOn={isVideoEnabled}
        micOn={isAudioEnabled}
        playAudio={false} // Don't play own audio
        playVideo={true}
        className="w-full h-full"
      />

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button onClick={endStream} variant="destructive">
          End Stream
        </Button>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 z-10">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        LIVE
      </div>
    </div>
  );
}

export default function AgoraLiveStream(props: AgoraLiveStreamProps) {
  const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <LiveStreamContent {...props} />
    </AgoraRTCProvider>
  );
}
```

```
app/
├── creator/
│   ├── live/
│   │   └── [streamId]/
│   │       └── page.tsx          # Live streaming page (Go Live)
│   ├── schedule/
│   │   └── page.tsx              # Calendar view (My Schedule)
│   └── content/
│       └── page.tsx              # Past streams with replays
├── live/
│   └── [streamId]/
│       └── page.tsx              # Viewer page (watch live/replay)
components/
├── live/
│   ├── AgoraLiveStream.tsx       # Agora publisher component
│   ├── AgoraViewer.tsx           # Agora subscriber component
│   ├── VidstackPlayer.tsx        # Replay player
│   └── StreamChat.tsx            # Live chat component
└── schedule/
    └── StreamCalendar.tsx        # react-big-calendar component
```

---

## 3. Components to Create

### **A. AgoraLiveStream.tsx** (Creator's Live View)

```tsx
"use client";

import { useState, useEffect } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface AgoraLiveStreamProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  onStreamEnd: () => void;
}

export default function AgoraLiveStream({
  appId,
  channelName,
  token,
  uid,
  onStreamEnd,
}: AgoraLiveStreamProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setClient(agoraClient);

      await agoraClient.setClientRole("host");
      await agoraClient.join(appId, channelName, token, uid);

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      await agoraClient.publish([videoTrack, audioTrack]);
      setIsLive(true);

      // Play local video
      videoTrack.play("local-video");
    };

    initAgora();

    return () => {
      localVideoTrack?.close();
      localAudioTrack?.close();
      client?.leave();
    };
  }, [appId, channelName, token, uid]);

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const endStream = async () => {
    await client?.leave();
    localVideoTrack?.close();
    localAudioTrack?.close();
    setIsLive(false);
    onStreamEnd();
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Local Video */}
      <div id="local-video" className="w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button onClick={endStream} variant="destructive">
          End Stream
        </Button>
      </div>

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
}
```

### **B. AgoraViewer.tsx** (Viewer's Live View)

```tsx
"use client";

import { useState, useEffect } from "react";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";

interface AgoraViewerProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}

export default function AgoraViewer({
  appId,
  channelName,
  token,
  uid,
}: AgoraViewerProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setClient(agoraClient);

      await agoraClient.setClientRole("audience");
      await agoraClient.join(appId, channelName, token, uid);

      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        
        if (mediaType === "video") {
          user.videoTrack?.play(`remote-video-${user.uid}`);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }

        setRemoteUsers((prev) => [...prev, user]);
      });

      agoraClient.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });
    };

    initAgora();

    return () => {
      client?.leave();
    };
  }, [appId, channelName, token, uid]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {remoteUsers.length > 0 ? (
        remoteUsers.map((user) => (
          <div
            key={user.uid}
            id={`remote-video-${user.uid}`}
            className="w-full h-full"
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>Waiting for stream to start...</p>
        </div>
      )}
    </div>
  );
}
```

### **C. VidstackPlayer.tsx** (Replay Player)

```tsx
"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VidstackPlayerProps {
  src: string; // HLS URL from S3
  title: string;
  poster?: string;
}

export default function VidstackPlayer({ src, title, poster }: VidstackPlayerProps) {
  return (
    <MediaPlayer
      title={title}
      src={src}
      poster={poster}
      aspectRatio="16/9"
      crossorigin=""
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
```

### **D. StreamCalendar.tsx** (Schedule View)

```tsx
"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface StreamEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    workoutType: string;
    thumbnail: string;
  };
}

interface StreamCalendarProps {
  events: StreamEvent[];
}

export default function StreamCalendar({ events }: StreamCalendarProps) {
  const router = useRouter();

  const handleSelectEvent = (event: StreamEvent) => {
    router.push(`/creator/live/${event.id}`);
  };

  return (
    <div className="h-[600px] bg-card p-4 rounded-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: "100%" }}
      />
    </div>
  );
}
```

---

## 3. Cloud Recording Setup (Frontend)

**Important:** Cloud recording is handled entirely on the frontend using Agora's client-side SDK.

### **Install Recording SDK:**

```bash
npm install agora-rtc-sdk-ng  # Already included with agora-rtc-react
```

### **Recording Flow:**

1. **Start Recording** when stream begins
2. **Upload to S3** using presigned URL
3. **Stop Recording** when stream ends
4. **Save replay URL** to backend

### **Get S3 Presigned URL from Backend:**

Add to `services/creator/index.ts`:

```typescript
getS3UploadUrl: async (streamId: string, filename: string) => {
  const axios = await createClientAuthInstance('creator');
  const response = await axios.get(`/creator/streams/${streamId}/upload-url`, {
    params: { filename }
  });
  return response.data;
},
```

### **Backend Endpoint for Presigned URL:**

```typescript
// GET /api/creator/streams/:streamId/upload-url
router.get('/streams/:streamId/upload-url', async (req, res) => {
  const { streamId } = req.params;
  const { filename } = req.query;
  
  const key = `creator/content/${streamId}/${filename}`;
  const uploadUrl = await getUploadUrl('creator/content', `${streamId}/${filename}`, 'video/mp4');
  
  return res.json({
    success: true,
    uploadUrl,
    key,
  });
});
```

---

## 4. Pages to Create

### **A. Creator Live Page** (`/creator/live/[streamId]/page.tsx`)

**Flow:**
1. Show camera preview (not streaming yet)
2. Creator clicks "Go Live" button
3. Start streaming + recording
4. Update backend (`isLive: true`)

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AgoraLiveStream from "@/components/live/AgoraLiveStream";
import StreamChat from "@/components/live/StreamChat";
import { creatorService } from "@/services/creator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Video, Mic, Settings } from "lucide-react";

export default function CreatorLivePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const streamId = params.streamId as string;

  const [streamData, setStreamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false); // Track if stream is live
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  // Fetch stream data and token
  useEffect(() => {
    const initStream = async () => {
      try {
        // Get stream token from backend
        const tokenResponse = await creatorService.getStreamToken(
          streamId,
          session?.user?.id!,
          'publisher'
        );

        if (tokenResponse.success) {
          setStreamData(tokenResponse);
          setIsPreviewReady(true);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to initialize stream");
        router.push("/creator/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      initStream();
    }
  }, [session, streamId]);

  // Go Live - Start streaming and recording
  const handleGoLive = async () => {
    try {
      setIsLive(true);
      
      // Update backend: stream is now live
      await creatorService.updateStreamStatus(streamId, { isLive: true });
      
      toast.success("You're live!");
    } catch (error: any) {
      toast.error("Failed to go live");
      setIsLive(false);
    }
  };

  // End Stream
  const handleStreamEnd = async (replayUrl?: string) => {
    try {
      // Update backend: stream ended
      await creatorService.stopStream(streamId, replayUrl);
      
      toast.success("Stream ended successfully");
      router.push("/creator/content");
    } catch (error: any) {
      toast.error("Failed to end stream");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stream / Preview */}
        <div className="lg:col-span-2">
          {isPreviewReady && (
            <div className="relative">
              <AgoraLiveStream
                appId={streamData.appId}
                channelName={streamData.channelId}
                token={streamData.token}
                uid={streamData.uid}
                streamId={streamId}
                isLive={isLive}
                onStreamEnd={handleStreamEnd}
              />
              
              {/* Go Live Button Overlay (shown before going live) */}
              {!isLive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-white">Ready to go live?</h2>
                    <p className="text-white/80">Your camera and microphone are ready</p>
                    <Button
                      onClick={handleGoLive}
                      size="lg"
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-xl"
                    >
                      🔴 Go Live
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat (only show when live) */}
        <div>
          {isLive ? (
            <StreamChat streamId={streamId} />
          ) : (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Stream Preview</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Camera is ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>Microphone is ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Click "Go Live" to start</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---### **B. VideoPlayer Component** (for Replays)

Create `components/live/VideoPlayer.tsx`:

```tsx
"use client";

import { MediaPlayer, MediaProvider, Gesture } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

export default function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  return (
    <MediaPlayer 
      title={title} 
      src={src} 
      poster={poster}
      aspectRatio="16/9"
      load="eager"
    >
      <MediaProvider />
      
      {/* 
        Default Layout includes:
        - Quality Selector (Settings menu)
        - Play/Pause
        - Volume
        - Fullscreen
        - Captions
      */}
      <DefaultVideoLayout 
        icons={defaultLayoutIcons}
        itemType="vod"
        // Ensure settings menu is enabled for quality control
        slots={{
           settingsMenu: true, // Enables Quality/Speed/Audio options
        }}
      />
    </MediaPlayer>
  );
}
```

**Note:** For quality selection to work, the `src` must be an HLS (`.m3u8`) stream containing multiple quality variants (720p, 480p, etc.). Agora recording typically produces a single quality file. To get multiple qualities, you would usually process the recording with a service like AWS MediaConvert after the stream ends.

---

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StreamCalendar from "@/components/schedule/StreamCalendar";
import { creatorService } from "@/services/creator";

export default function SchedulePage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchScheduledStreams = async () => {
      const response = await creatorService.getScheduledStreams(session?.user?.id!);
      
      if (response.success) {
        const formattedEvents = response.streams.map((stream: any) => ({
          id: stream.id,
          title: stream.title,
          start: new Date(stream.startTime),
          end: stream.endTime ? new Date(stream.endTime) : new Date(stream.startTime),
          resource: {
            workoutType: stream.workoutType,
            thumbnail: stream.thumbnail,
          },
        }));
        
        setEvents(formattedEvents);
      }
    };

    if (session?.user?.id) {
      fetchScheduledStreams();
    }
  }, [session]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Schedule</h1>
      <StreamCalendar events={events} />
    </div>
  );
}
```

---

## 5. Services to Add

Add to `services/creator/index.ts`:

```typescript
// Get Agora token for streaming
getStreamToken: async (streamId: string, userId: string, role: 'publisher' | 'subscriber') => {
  const axios = await createClientAuthInstance('CREATOR');
  const response = await axios.get(`/streams/${streamId}/token`, {
    params: { userId, role }
  });
  return response.data;
},

// Update stream status (go live)
updateStreamStatus: async (streamId: string, data: { isLive: boolean }) => {
  const axios = await createClientAuthInstance('CREATOR');
  const response = await axios.patch(`/creator/streams/${streamId}/status`, data);
  return response.data;
},

// Stop stream and save replay URL
stopStream: async (streamId: string, replayUrl?: string) => {
  const axios = await createClientAuthInstance('CREATOR');
  const response = await axios.post(`/creator/streams/${streamId}/stop`, { replayUrl });
  return response.data;
},

// Get S3 presigned URL for recording upload
getS3UploadUrl: async (streamId: string, filename: string) => {
  const axios = await createClientAuthInstance('CREATOR');
  const response = await axios.get(`/creator/streams/${streamId}/upload-url`, {
    params: { filename }
  });
  return response.data;
},

getScheduledStreams: async (creatorId: string) => {
  const axios = await createClientAuthInstance('CREATOR');
  const response = await axios.get(`/creator/${creatorId}/scheduled-streams`);
  return response.data;
},
```

---

## 6. Complete Flow

### **Go Live Now:**
1. Creator clicks "Go Live" → generates `streamId` with `cuid()`
2. Redirects to `/creator/live/${streamId}`
3. Frontend calls `createStream` API with `isScheduled: false`
4. Backend:
   - Creates stream record with `isLive: true`
   - Generates Agora token
   - Sends "LIVE NOW" emails to followers/subscribers
   - Starts cloud recording
5. Frontend initializes Agora publisher
6. Creator goes live!
7. When done, creator clicks "End Stream"
8. Backend stops recording, generates replay URL
9. Redirect to `/creator/content`

### **Schedule Live:**
1. Creator clicks "Schedule Live" → generates `streamId`
2. Shows dialog to pick date/time
3. Frontend calls `createStream` API with `isScheduled: true`, `startTime`
4. Backend:
   - Creates stream record with `isLive: false`
   - Sends "Scheduled" emails with timezone-aware times
   - Schedules reminder emails for 15 min before
5. Stream appears in calendar view
6. At scheduled time, creator can go live from calendar



If you're not careful, you'll get timezone bugs. Here's what can go wrong:

❌ Bad Approach (Common Mistake):
typescript
// Frontend - User selects "6:00 PM" on Dec 17
const selectedDate = "2025-12-17";
const selectedTime = "18:00";
// ❌ WRONG - This creates a UTC date, not local!
const startTime = new Date(`${selectedDate}T${selectedTime}:00Z`);
// Result: 2025-12-17T18:00:00.000Z (6 PM UTC, not 6 PM EST!)
// When user in NYC sees this, they'll see 1:00 PM instead of 6:00 PM!
✅ Correct Approach:
typescript
// Frontend - User selects "6:00 PM" on Dec 17
const selectedDate = "2025-12-17";
const selectedTime = "18:00";
// ✅ CORRECT - Create local date, then convert to UTC
const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
// Result: 2025-12-17T18:00:00 (local time in user's timezone)
// Send to backend as ISO string (auto-converts to UTC)
const startTime = localDateTime.toISOString();
// Result: "2025-12-17T23:00:00.000Z" (6 PM EST = 11 PM UTC)
// Send to API
await fetch('/api/streams', {
  method: 'POST',
  body: JSON.stringify({
    title: "Evening HIIT",
    startTime: startTime, // ← UTC string
    creatorId: userId
  })
});
---

## Summary

✅ Agora ILS integration for live streaming
✅ Vidstack player for HLS replay
✅ react-big-calendar for schedule view
✅ Email notifications 
✅ Cloud recording to S3
✅ Complete creator and viewer flows

Ready to implement! 🚀
