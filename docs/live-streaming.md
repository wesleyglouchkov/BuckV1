# Live Streaming Workflow

This documents the live streaming feature built with **Agora ILS** and **Vidstack**.

## Environment Setup

```env
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

## Dependencies

- `agora-rtc-react` - Agora React SDK (includes agora-rtc-sdk-ng)
- `dayjs` - Date/timezone handling  
- `react-big-calendar` + `date-fns` - Calendar
- `@vidstack/react` - Video replay player

## Hooks Used (from agora-rtc-react)

| Hook | Purpose |
|------|---------|
| `useJoin` | Auto join/leave channel |
| `useLocalCameraTrack` | Create camera track |
| `useLocalMicrophoneTrack` | Create mic track |
| `usePublish` | Auto publish tracks |
| `useRemoteUsers` | Get remote users |
| `useRTCClient` | Get client instance |
| `useIsConnected` | Connection status |
| `useNetworkQuality` | Network quality indicator |
| `useVolumeLevel` | Audio level meter |

## Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AgoraLiveStream` | `components/live/` | Creator broadcast with recording |
| `AgoraViewer` | `components/live/` | Viewer (publisher/subscriber) |
| `VideoPlayer` | `components/live/` | Vidstack replay player |
| `RecordingConsentDialog` | `components/live/` | Consent before joining |
| `StreamChat` | `components/live/` | Live chat |
| `StreamCalendar` | `components/schedule/` | Calendar view |
| `ScheduleStreamDialog` | `components/schedule/` | Schedule streams |

## Creator Flow

1. Navigate to `/creator/schedule`
2. Click **"Go Live Now"** or **"Schedule Stream"**
3. For live: Preview mode → Click **"Go Live"** → Recording starts
4. End stream → Recording uploads to S3

## Viewer Flow

1. Navigate to `/live/[streamId]`
2. Consent dialog appears:
   - **Join & Participate** → Publisher role (camera/mic)
   - **Watch Only** → Subscriber role
3. Watch stream with network quality indicator

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/creator/streams/create` | POST | Create/schedule stream |
| `/api/streams/:streamId/token` | GET | Get Agora token |
| `/api/creator/streams/:streamId/stop` | POST | Stop stream |
| `/api/creator/streams/:streamId/status` | PATCH | Update live status |
