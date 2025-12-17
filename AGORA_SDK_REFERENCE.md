# Agora RTC React SDK - Complete API Reference

## Package Information
- **Package:** `agora-rtc-react`
- **Version:** v2.5.0 (Latest)
- **Product:** Interactive Live Streaming (ILS)
- **SDK:** Video SDK for React
- **Includes:** `agora-rtc-sdk-ng` (automatically bundled)

---

## Enums

### Connection & State
- [AREAS](./enums/AREAS.html)
- [AudienceLatencyLevelType](./enums/AudienceLatencyLevelType.html)
- [ConnectionDisconnectedReason](./enums/ConnectionDisconnectedReason.html)
- [VideoState](./enums/VideoState.html)
- [ImageModerationConnectionState](./enums/ImageModerationConnectionState.html)

### Media Relay
- [ChannelMediaRelayError](./enums/ChannelMediaRelayError.html)
- [ChannelMediaRelayEvent](./enums/ChannelMediaRelayEvent.html)
- [ChannelMediaRelayState](./enums/ChannelMediaRelayState.html)

### Stream Types
- [RemoteStreamFallbackType](./enums/RemoteStreamFallbackType.html)
- [RemoteStreamType](./enums/RemoteStreamType.html)

---

## Classes

- [AgoraRTCReactError](./classes/AgoraRTCReactError.html) - Error handling class

---

## Interfaces

### Provider Props
- [AgoraRTCScreenShareProviderProps](./interfaces/AgoraRTCScreenShareProviderProps.html)

### Client Configuration
- [ClientConfig](./interfaces/ClientConfig.html)
- [ClientRoleOptions](./interfaces/ClientRoleOptions.html)
- [JoinOptions](./interfaces/JoinOptions.html)

### Track Configuration
- [CameraVideoTrackInitConfig](./interfaces/CameraVideoTrackInitConfig.html)
- [MicrophoneAudioTrackInitConfig](./interfaces/MicrophoneAudioTrackInitConfig.html)
- [ScreenVideoTrackInitConfig](./interfaces/ScreenVideoTrackInitConfig.html)
- [CustomAudioTrackInitConfig](./interfaces/CustomAudioTrackInitConfig.html)
- [CustomVideoTrackInitConfig](./interfaces/CustomVideoTrackInitConfig.html)
- [BufferSourceAudioTrackInitConfig](./interfaces/BufferSourceAudioTrackInitConfig.html)

### Encoder Configuration
- [AudioEncoderConfiguration](./interfaces/AudioEncoderConfiguration.html)
- [VideoEncoderConfiguration](./interfaces/VideoEncoderConfiguration.html)
- [LowStreamParameter](./interfaces/LowStreamParameter.html)

### Core Interfaces
- [IAgoraRTC](./interfaces/IAgoraRTC.html) - Main SDK interface
- [IAgoraRTCClient](./interfaces/IAgoraRTCClient.html) - Client interface
- [IAgoraRTCRemoteUser](./interfaces/IAgoraRTCRemoteUser.html) - Remote user interface

### Track Interfaces
- [ITrack](./interfaces/ITrack.html) - Base track interface
- [ILocalTrack](./interfaces/ILocalTrack.html) - Local track base
- [IRemoteTrack](./interfaces/IRemoteTrack.html) - Remote track base
- [ILocalAudioTrack](./interfaces/ILocalAudioTrack.html) - Local audio track
- [ILocalVideoTrack](./interfaces/ILocalVideoTrack.html) - Local video track
- [IRemoteAudioTrack](./interfaces/IRemoteAudioTrack.html) - Remote audio track
- [IRemoteVideoTrack](./interfaces/IRemoteVideoTrack.html) - Remote video track
- [ICameraVideoTrack](./interfaces/ICameraVideoTrack.html) - Camera track
- [IMicrophoneAudioTrack](./interfaces/IMicrophoneAudioTrack.html) - Microphone track
- [IBufferSourceAudioTrack](./interfaces/IBufferSourceAudioTrack.html) - Buffer audio track

### Component Props
- [LocalUserProps](./interfaces/LocalUserProps.html)
- [LocalVideoTrackProps](./interfaces/LocalVideoTrackProps.html)
- [LocalAudioTrackProps](./interfaces/LocalAudioTrackProps.html)
- [RemoteUserProps](./interfaces/RemoteUserProps.html)
- [RemoteVideoTrackProps](./interfaces/RemoteVideoTrackProps.html)
- [RemoteAudioTrackProps](./interfaces/RemoteAudioTrackProps.html)

### Statistics
- [AgoraRTCStats](./interfaces/AgoraRTCStats.html)
- [LocalAudioTrackStats](./interfaces/LocalAudioTrackStats.html)
- [LocalVideoTrackStats](./interfaces/LocalVideoTrackStats.html)
- [RemoteAudioTrackStats](./interfaces/RemoteAudioTrackStats.html)
- [RemoteVideoTrackStats](./interfaces/RemoteVideoTrackStats.html)

### Network Quality
- [NetworkQuality](./interfaces/NetworkQuality.html)
- [NetworkQualityEx](./interfaces/NetworkQualityEx.html)

### Live Streaming
- [LiveStreamingTranscodingConfig](./interfaces/LiveStreamingTranscodingConfig.html)
- [LiveStreamingTranscodingUser](./interfaces/LiveStreamingTranscodingUser.html)
- [LiveStreamingTranscodingImage](./interfaces/LiveStreamingTranscodingImage.html)

### Media Relay
- [IChannelMediaRelayConfiguration](./interfaces/IChannelMediaRelayConfiguration.html)
- [ChannelMediaRelayInfo](./interfaces/ChannelMediaRelayInfo.html)

### Device & Media
- [DeviceInfo](./interfaces/DeviceInfo.html)
- [AudioSourceOptions](./interfaces/AudioSourceOptions.html)
- [VideoPlayerConfig](./interfaces/VideoPlayerConfig.html)
- [ConstrainLong](./interfaces/ConstrainLong.html)

### Other
- [ElectronDesktopCapturerSource](./interfaces/ElectronDesktopCapturerSource.html)
- [EventCustomReportParams](./interfaces/EventCustomReportParams.html)
- [ImageTypedData](./interfaces/ImageTypedData.html)

---

## Types

### Configuration Presets
- [AudioEncoderConfigurationPreset](./types/AudioEncoderConfigurationPreset.html)
- [VideoEncoderConfigurationPreset](./types/VideoEncoderConfigurationPreset.html)
- [ScreenEncoderConfigurationPreset](./types/ScreenEncoderConfigurationPreset.html)

### SDK Configuration
- [SDK_MODE](./types/SDK_MODE.html) - "rtc" | "live"
- [SDK_CODEC](./types/SDK_CODEC.html) - "vp8" | "h264"
- [ClientRole](./types/ClientRole.html) - "host" | "audience"

### States
- [ConnectionState](./types/ConnectionState.html)
- [DeviceState](./types/DeviceState.html)
- [AudioSourceState](./types/AudioSourceState.html)

### Other
- [UID](./types/UID.html) - User ID type
- [EncryptionMode](./types/EncryptionMode.html)
- [ScreenSourceType](./types/ScreenSourceType.html)
- [FetchArgs](./types/FetchArgs.html)

---

## Components

### Providers
- [AgoraRTCProvider](./functions/AgoraRTCProvider.html) - Main context provider
- [AgoraRTCScreenShareProvider](./functions/AgoraRTCScreenShareProvider.html) - Screen share provider

### Local Components
- [LocalUser](./functions/LocalUser.html) - Render local camera + mic
- [LocalVideoTrack](./functions/LocalVideoTrack.html) - Render local video
- [LocalAudioTrack](./functions/LocalAudioTrack.html) - Render local audio

### Remote Components
- [RemoteUser](./functions/RemoteUser.html) - Render remote user
- [RemoteVideoTrack](./functions/RemoteVideoTrack.html) - Render remote video
- [RemoteAudioTrack](./functions/RemoteAudioTrack.html) - Render remote audio

### Utilities
- [TrackBoundary](./functions/TrackBoundary.html) - Error boundary for tracks

---

## Hooks

### Connection & Join
- [useJoin](./functions/useJoin.html) - Auto join/leave channel
- [useIsConnected](./functions/useIsConnected.html) - Check connection status
- [useConnectionState](./functions/useConnectionState.html) - Get connection state
- [useCurrentUID](./functions/useCurrentUID.html) - Get current user ID

### Client
- [useRTCClient](./functions/useRTCClient.html) - Get RTC client instance
- [useRTCScreenShareClient](./functions/useRTCScreenShareClient.html) - Get screen share client

### Local Tracks
- [useLocalCameraTrack](./functions/useLocalCameraTrack.html) - Create camera track
- [useLocalMicrophoneTrack](./functions/useLocalMicrophoneTrack.html) - Create mic track
- [useLocalScreenTrack](./functions/useLocalScreenTrack.html) - Create screen share track

### Remote Tracks
- [useRemoteUsers](./functions/useRemoteUsers.html) - Get all remote users
- [useRemoteUserTrack](./functions/useRemoteUserTrack.html) - Get specific user track
- [useRemoteVideoTracks](./functions/useRemoteVideoTracks.html) - Get all remote video tracks
- [useRemoteAudioTracks](./functions/useRemoteAudioTracks.html) - Get all remote audio tracks

### Publishing
- [usePublish](./functions/usePublish.html) - Auto publish/unpublish tracks

### Playback
- [useAutoPlayVideoTrack](./functions/useAutoPlayVideoTrack.html) - Auto play video
- [useAutoPlayAudioTrack](./functions/useAutoPlayAudioTrack.html) - Auto play audio

### Events
- [useClientEvent](./functions/useClientEvent.html) - Listen to client events
- [useTrackEvent](./functions/useTrackEvent.html) - Listen to track events

### Quality & Stats
- [useNetworkQuality](./functions/useNetworkQuality.html) - Get network quality
- [useVolumeLevel](./functions/useVolumeLevel.html) - Get audio volume level

---

## Variables

- [VERSION](./variables/VERSION.html) - SDK version
- [default](./variables/default.html) - Default export (AgoraRTC)

---

## Quick Start Example

```tsx
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  AgoraRTCProvider,
  LocalUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
} from "agora-rtc-react";

function LiveStream() {
  const { localCameraTrack } = useLocalCameraTrack();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();

  useJoin({
    appid: "YOUR_APP_ID",
    channel: "test-channel",
    token: "YOUR_TOKEN",
    uid: 123456,
  });

  usePublish([localCameraTrack, localMicrophoneTrack]);

  return (
    <LocalUser
      audioTrack={localMicrophoneTrack}
      videoTrack={localCameraTrack}
      cameraOn={true}
      micOn={true}
    />
  );
}

export default function App() {
  const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <LiveStream />
    </AgoraRTCProvider>
  );
}
```

---

## Common Use Cases

### 1. Interactive Live Streaming (ILS)
```tsx
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
// Set role to "host" for broadcaster, "audience" for viewer
await client.setClientRole("host");
```

### 2. Video Call (RTC)
```tsx
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

### 3. Screen Sharing
```tsx
const { screenTrack } = useLocalScreenTrack();
usePublish([screenTrack]);
```

### 4. Remote User Subscription
```tsx
const remoteUsers = useRemoteUsers();
remoteUsers.map(user => (
  <RemoteUser key={user.uid} user={user} />
));
```

---

## Important Notes

1. **Auto-bundled SDK**: Since v2.0.0, `agora-rtc-sdk-ng` is included automatically
2. **Mode Selection**: Use `"live"` for ILS, `"rtc"` for video calls
3. **Codec**: `"vp8"` is recommended for better compatibility
4. **Hooks Auto-cleanup**: All hooks automatically clean up on unmount
5. **Provider Required**: Wrap components in `AgoraRTCProvider`

---

## Resources

- [Official Documentation](https://docs.agora.io/en/video-calling/overview/product-overview)
- [GitHub Repository](https://github.com/AgoraIO-Extensions/agora-rtc-react)
- [API Reference](https://agoraio-extensions.github.io/agora-rtc-react/)
- [Examples](https://github.com/AgoraIO-Extensions/agora-rtc-react/tree/main/example)

---

**Last Updated:** December 16, 2024
**SDK Version:** 2.5.0
