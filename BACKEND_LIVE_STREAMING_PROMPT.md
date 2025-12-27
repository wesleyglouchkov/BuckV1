# Backend API Prompt: Live Streaming with Agora ILS

## Overview
Create a comprehensive live streaming system using Agora ILS (Interactive Live Streaming) with cloud recording to S3, email notifications for followers/subscribers, and timezone-aware scheduling.

---

## 1. Environment Variables Required

Add to `.env`:
```env
# Agora (for token generation - REQUIRED for security)
AGORA_APP_ID=sdadad
AGORA_APP_CERTIFICATE=<your_app_certificate>  # Required for backend token generation

# AWS S3 (for storing replay URLs - frontend uploads directly)
AWS_REGION=<your_region>
AWS_BUCKET_NAME=<your_bucket>

# Email Service
EMAIL_SERVICE_API_KEY=<your_email_api_key>
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Note:** 
- **Token generation** is done on backend for security
- **Cloud recording** is handled on frontend (client-side SDK)
- **S3 uploads** are done directly from frontend using presigned URLs

---

## 2. Install Required Packages

```bash
npm install agora-token
npm install @aws-sdk/client-s3
npm install dayjs          # For timezone handling
npx api install "@render-api/v1.0#2vyff1qcmj8pzoaa"  # For Render cron jobs
```

---

## 3. API Endpoints to Create

### **A. Create/Schedule Live Stream**

**Endpoint:** `POST /api/creator/streams/create`

**Request Body:**
```typescript
{
  creatorId: string;
  title: string;
  description?: string;
  workoutType?: string;
  thumbnail?: string;
  startTime: string; // ISO 8601 format
  isScheduled: boolean; // true for scheduled, false for go live now
}
```

**Response:**
```typescript
{
  success: boolean;
  stream: {
    id: string;
    title: string;
    agoraChannelId: string;
    agoraToken: string;
    agoraUid: number;
    startTime: Date;
    isLive: boolean;
  };
  message: string;
}
```

**Logic:**
1. Validate creator exists and is active
2. Generate unique Agora channel ID (use stream.id)
3. Generate Agora RTC token for creator (role: publisher)
4. Create stream record in database:
   ```typescript
   const stream = await db.stream.create({
     data: {
       id: cuid(),
       title,
       description,
       workoutType,
       thumbnail,
       startTime: new Date(startTime),
       isLive: !isScheduled, // true if going live now
       agoraChannelId: streamId,
       creatorId,
     },
   });
   ```
5. If `isScheduled === false` (Go Live Now):
   - Set `isLive = true`
   - Send "Creator is LIVE NOW" emails to followers/subscribers
6. If `isScheduled === true` (Schedule Live):
   - Set `isLive = false`
   - Send "Creator scheduled a live stream" emails with timezone-aware time
   - Schedule a cron job to send reminder 15 minutes before start
7. Return stream details with Agora token

**Note:** This is an **Interactive Live Stream** where:
- Creator is the host (publisher role)
- Members can join as participants (can turn on camera/mic)
- Creator has moderation controls (block, mute participants)

---

### **B. Generate Agora Token** (Required for Security)

**Endpoint:** `GET /api/streams/:streamId/token`

**Query Params:**
```typescript
{
  userId: string;
  role: 'publisher' | 'subscriber'; // publisher for creator + interactive members
}
```

**Response:**
```typescript
{
  success: boolean;
  token: string;
  uid: number;
  channelId: string;
  appId: string;
}
```

**Logic:**
1. Get stream details
2. Generate Agora RTC token:
   ```typescript
   import { RtcTokenBuilder, RtcRole } from 'agora-token';
   
   const appId = process.env.AGORA_APP_ID;
   const appCertificate = process.env.AGORA_APP_CERTIFICATE;
   const channelName = stream.agoraChannelId;
   const uid = parseInt(userId.substring(0, 8), 36); // Convert to number
   const role = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
   const expirationTimeInSeconds = 3600; // 1 hour
   const currentTimestamp = Math.floor(Date.now() / 1000);
   const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
   
   const token = RtcTokenBuilder.buildTokenWithUid(
     appId,
     appCertificate,
     channelName,
     uid,
     role,
     privilegeExpiredTs
   );
   ```
3. Return token, channel details, and app ID

**Note:** Moderation (block, mute) is handled on the frontend using Agora's client-side SDK controls.

---

### **C. Stop Live Stream**

**Endpoint:** `POST /api/creator/streams/:streamId/stop`

**Request Body:**
```typescript
{
  streamId: string;
  replayUrl?: string; // Optional: S3 URL if recording was done on frontend
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Logic:**
1. Update stream record:
   ```typescript
   await db.stream.update({
     where: { id: streamId },
     data: {
       isLive: false,
       endTime: new Date(),
       replayUrl: replayUrl || null, // Store replay URL if provided
     },
   });
   ```
2. Return success message

---

### **D. Update Stream Status** (When Creator Clicks "Go Live")

**Endpoint:** `PATCH /api/creator/streams/:streamId/status`

**Request Body:**
```typescript
{
  isLive: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Logic:**
1. Update stream record:
   ```typescript
   await db.stream.update({
     where: { id: streamId },
     data: { isLive },
   });
   ```
2. If `isLive === true`, send "LIVE NOW" emails to followers/subscribers
3. Return success message

---

### **E. Send Email Notifications**

**Endpoint:** `POST /api/creator/streams/:streamId/notify`

**Request Body:**
```typescript
{
  streamId: string;
  type: 'live_now' | 'scheduled' | 'reminder';
}
```

**Response:**
```typescript
{
  success: boolean;
  emailsSent: number;
}
```

**Logic:**
1. Get stream details and creator info
2. Fetch all followers and subscribers of the creator:
   ```typescript
   const followers = await db.follow.findMany({
     where: { followedId: creatorId },
     include: { follower: true },
   });

   const subscribers = await db.subscription.findMany({
     where: { creatorId, status: 'active' },
     include: { member: true },
   });

   // Combine and deduplicate
   const recipients = [...new Set([
     ...followers.map(f => f.follower),
     ...subscribers.map(s => s.member),
   ])];
   ```
3. For each recipient, send email based on type:

   **A. Live Now Email:**
   ```
   Subject: 🔴 [Creator Name] is LIVE NOW!
   
   Hi [Member Name],
   
   [Creator Name] just started a live stream!
   
   📺 Title: [Stream Title]
   🏋️ Workout Type: [Workout Type]
   
   Join now: [FRONTEND_URL]/live/[streamId]
   
   Don't miss out!
   ```

   **B. Scheduled Email:**
   ```
   Subject: 📅 [Creator Name] scheduled a live stream
   
   Hi [Member Name],
   
   [Creator Name] has scheduled a new live stream!
   
   📺 Title: [Stream Title]
   🏋️ Workout Type: [Workout Type]
   🕐 Start Time: [Formatted Time in Creator's Timezone]
   
   ⏰ In your timezone ([Member Timezone]): [Converted Time]
   
   Mark your calendar: [FRONTEND_URL]/live/[streamId]
   
   See you there!
   ```

   **C. Reminder Email (15 min before):**
   ```
   Subject: ⏰ [Creator Name] goes live in 15 minutes!
   
   Hi [Member Name],
   
   Reminder: [Creator Name]'s live stream starts soon!
   
   📺 Title: [Stream Title]
   🕐 Starts at: [Time in Member's Timezone]
   
   Join here: [FRONTEND_URL]/live/[streamId]
   ```

4. Use timezone conversion:
   ```typescript
   import dayjs from 'dayjs';
   import utc from 'dayjs/plugin/utc';
   import timezone from 'dayjs/plugin/timezone';
   
   dayjs.extend(utc);
   dayjs.extend(timezone);
   
   const creatorTime = dayjs(startTime).tz(creatorTimezone);
   const memberTime = dayjs(startTime).tz(memberTimezone);
   
   const formattedCreatorTime = creatorTime.format('MMMM D, YYYY at h:mm A z');
   const formattedMemberTime = memberTime.format('MMMM D, YYYY at h:mm A z');
   ```

5. Return count of emails sent

---

### **F. Get Creator's Scheduled Streams**

**Endpoint:** `GET /api/creator/:creatorId/scheduled-streams`

**Query Params:**
```typescript
{
  startDate?: string; // ISO 8601
  endDate?: string;   // ISO 8601
}
```

**Response:**
```typescript
{
  success: boolean;
  streams: Array<{
    id: string;
    title: string;
    description: string;
    workoutType: string;
    thumbnail: string;
    startTime: Date;
    endTime: Date | null;
    isLive: boolean;
  }>;
}
```

**Logic:**
1. Fetch streams for creator within date range:
   ```typescript
   const streams = await db.stream.findMany({
     where: {
       creatorId,
       startTime: {
         gte: startDate ? new Date(startDate) : undefined,
         lte: endDate ? new Date(endDate) : undefined,
       },
     },
     orderBy: { startTime: 'asc' },
   });
   ```
2. Return streams

---

## 4. Database Schema Updates

Add to `Stream` model in `schema.prisma`:

```prisma
model Stream {
  // ... existing fields ...
  
  // No additional fields needed for cloud recording
  // Recording is handled on frontend with client-side SDK
  
  @@map("streams")
}
```

**Note:** Cloud recording is handled entirely on the frontend. The `replayUrl` field (already in your schema) will store the S3 URL after frontend uploads the recording.

---

## 5. Email Notification Flow with 15-Minute Reminders

Emails are sent at three key moments:

1. **Creator schedules a stream:**
   - Send "Scheduled" email to all followers/subscribers
   - Include timezone-aware start time

2. **15 minutes before stream starts:**
   - Send "Reminder" email to all followers/subscribers
   - Triggered by Render Cron Job

3. **Creator goes live:**
   - Send "LIVE NOW" email to all followers/subscribers
   - Include stream link

### **Render Cron Job Setup**

**Install Render API SDK:**
```bash
npx api install "@render-api/v1.0#2vyff1qcmj8pzoaa"
```

**Environment Variables:**
```env
RENDER_API_KEY=rnd_I4fTrRfVMdgAhgzPvhT8v41zmqja
RENDER_SERVICE_ID=srv-d4r38dqli9vc73a6ufv0
```

### **Create Cron Endpoint**

Create `src/routes/cron.ts`:

```typescript
import { Router } from 'express';
import { db } from '../database';
import dayjs from 'dayjs';
import { sendStreamNotification } from '../services/emailService';
import renderApi from '@api/render-api';

const router = Router();

// Endpoint to trigger email reminders
router.post('/trigger-stream-emails', async (req, res) => {
  try {
    const now = dayjs();
    const in15Minutes = now.add(15, 'minute');
    
    // Find streams starting in the next 15 minutes that haven't been reminded
    const upcomingStreams = await db.stream.findMany({
      where: {
        isLive: false,
        reminderSent: false,
        startTime: {
          gte: now.toDate(),              // Starting from now
          lte: in15Minutes.toDate(),      // Up to 15 minutes from now
        },
      },
      include: { creator: true },
    });
    
    // Send reminder emails
    for (const stream of upcomingStreams) {
      await sendStreamNotification(stream.id, 'reminder');
      
      // Mark reminder as sent
      await db.stream.update({
        where: { id: stream.id },
        data: { reminderSent: true },
      });
      
      console.log(`Sent reminder for stream: ${stream.id} (starts at ${stream.startTime})`);
    }
    
    return res.json({
      success: true,
      remindersSent: upcomingStreams.length,
      streams: upcomingStreams.map(s => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
      })),
    });
    });
  } catch (error: any) {
    console.error('Stream reminder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
```

### **Create Dedicated Script for Render Job**

**Create `scripts/trigger-stream-emails.js`:**

```javascript
// This script is run by Render when the job is triggered
const { db } = require('../dist/database');
const dayjs = require('dayjs');
const { sendStreamNotification } = require('../dist/services/emailService');

async function checkAndSendReminders() {
  try {
    console.log('Checking for streams needing reminders...');
    
    const now = dayjs();
    const in15Minutes = now.add(15, 'minute');
    
    const upcomingStreams = await db.stream.findMany({
      where: {
        isLive: false,
        reminderSent: false,
        startTime: {
          gte: now.toDate(),
          lte: in15Minutes.toDate(),
        },
      },
      include: { creator: true },
    });
    
    console.log(`Found ${upcomingStreams.length} streams needing reminders`);
    
    for (const stream of upcomingStreams) {
      await sendStreamNotification(stream.id, 'reminder');
      
      await db.stream.update({
        where: { id: stream.id },
        data: { reminderSent: true },
      });
      
      console.log(`✅ Sent reminder for stream: ${stream.id}`);
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndSendReminders();
```

### **Configure in Render Dashboard**

**Step 1: Add Background Worker/Job**

1. Go to your Render service dashboard
2. Click **"Background Workers"** or **"Jobs"** tab
3. Click **"New Background Worker"** or **"New Job"**
4. Configure:
   - **Name:** `triggerStreamEmails`
   - **Command:** `node scripts/trigger-stream-emails.js`
   - **Environment:** Same as your web service

**Step 2: Trigger the Job via Render API**

Use **EasyCron** or **cron-job.org** to trigger the Render job every 14 minutes:

**EasyCron Configuration:**
- **URL:** `https://api.render.com/v1/services/srv-d4r38dqli9vc73a6ufv0/jobs`
- **Method:** `POST`
- **Schedule:** `*/14 * * * *` (every 14 minutes)
- **Headers:**
  ```
  accept: application/json
  authorization: Bearer rnd_I4fTrRfVMdgAhgzPvhT8v41zmqja
  content-type: application/json
  ```
- **Body:**
  ```json
  {
    "startCommand": "node scripts/trigger-stream-emails.js"
  }
  ```

**Step 3: Verify**

- Check Render logs after 14 minutes
- Look for: `Found X streams needing reminders`
- Verify emails are being sent

---

### **Alternative: Simple HTTP Endpoint**

If you prefer not to use Render Jobs API, create a simple HTTP endpoint:

**Create `src/routes/cron.ts`:**
```typescript
router.get('/check-stream-reminders', async (req, res) => {
  // Verify request is from cron service
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = dayjs();
  const in15Minutes = now.add(15, 'minute');
  
  const upcomingStreams = await db.stream.findMany({
    where: {
      isLive: false,
      reminderSent: false,
      startTime: {
        gte: now.toDate(),
        lte: in15Minutes.toDate(),
      },
    },
    include: { creator: true },
  });
  
  for (const stream of upcomingStreams) {
    await sendStreamNotification(stream.id, 'reminder');
    await db.stream.update({
      where: { id: stream.id },
      data: { reminderSent: true },
    });
  }
  
  return res.json({
    success: true,
    remindersSent: upcomingStreams.length,
  });
});
```

**Then use EasyCron to call:**
- **URL:** `https://your-api.onrender.com/api/cron/check-stream-reminders`
- **Schedule:** `*/14 * * * *`
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`

---

### **Configure in Render Dashboard (Old Section - Remove)**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Select your backend service (e.g., "BuckV1 API")

2. **Navigate to Cron Jobs**
   - In the left sidebar, click **"Cron Jobs"**
   - Click **"New Cron Job"** button

3. **Configure the Cron Job**
   - **Name:** `Stream Email Reminders`
   - **Command:** Leave empty (we're using HTTP endpoint)
   - **Schedule:** `*/14 * * * *`
   - **Region:** Same as your service

4. **Set HTTP Endpoint (Advanced)**
   - Click **"Advanced"** or **"Environment"** tab
   - Add environment variable:
     - **Key:** `CRON_ENDPOINT`
     - **Value:** `https://your-api.onrender.com/api/cron/check-stream-reminders`

5. **Add Authorization Header**
   - In your backend code, verify the auth header:
   ```typescript
   const authHeader = req.headers.authorization;
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
   ```
   - Add `CRON_SECRET` to your Render environment variables

6. **Alternative: Use Render's Built-in Cron**
   
   If Render doesn't support HTTP cron directly, use this approach:
   
   **Create a script in your backend:**
   
   `scripts/check-reminders.js`:
   ```javascript
   const axios = require('axios');
   
   async function checkReminders() {
     try {
       const response = await axios.get(
         `${process.env.BACKEND_URL}/api/cron/check-stream-reminders`,
         {
           headers: {
             Authorization: `Bearer ${process.env.CRON_SECRET}`
           }
         }
       );
       console.log('Reminders checked:', response.data);
     } catch (error) {
       console.error('Failed to check reminders:', error.message);
     }
   }
   
   checkReminders();
   ```
   
   **Then in Render Cron Job:**
   - **Command:** `node scripts/check-reminders.js`
   - **Schedule:** `*/14 * * * *`

7. **Save and Deploy**
   - Click **"Create Cron Job"**
   - Render will automatically run it every 14 minutes

**Verify It's Working:**
- Check Render logs after 14 minutes
- Look for: `Sent reminder for stream: <streamId>`

---

---

Then configure Render Cron Job in Render Dashboard:
- **URL:** `https://your-api.onrender.com/api/cron/check-stream-reminders`
- **Schedule:** `*/14 * * * *` (every 14 minutes)
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`

**Why 14 minutes?**
- Runs every 14 minutes
- Checks for streams starting in next 15 minutes
- Ensures reminders are sent between 1-15 minutes before stream starts
- More efficient than checking every minute

### **Database Schema Update**

Add `reminderSent` field to Stream model:

```prisma
model Stream {
  id             String   @id @default(cuid())
  title          String
  description    String?
  workoutType    String?
  thumbnail      String?
  startTime      DateTime
  endTime        DateTime?
  isLive         Boolean  @default(false)
  replayUrl      String?
  agoraChannelId String?
  viewerCount    Int      @default(0)
  
  // Cloud Recording
  recordingId    String?
  resourceId     String?
  recordingSid   String?
  
  // Email tracking
  reminderSent   Boolean  @default(false)  // ← Add this

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  creator        User     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  creatorId      String

  chats          StreamChat[]
  flaggedContent FlaggedContent[]

  @@map("streams")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_reminder_sent_field
```

---

## 6. Helper Functions

### **A. Generate Agora Token**
```typescript
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export function generateAgoraToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber'
): string {
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const roleNum = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    roleNum,
    privilegeExpiredTs
  );
}
```

---

## 7. Email Templates

Create reusable email templates with timezone of the stream starting with it.

---

## Summary

This backend implementation provides:
✅ Agora token generation (backend for security)
✅ Email notifications for followers/subscribers
✅ Timezone-aware scheduling and reminders (via Render cron jobs)
✅ Scheduled stream management
✅ Stream CRUD operations

**Backend Responsibilities:**
- ✅ Generate secure Agora tokens
- ✅ Send email notifications (scheduled, reminder, live now)
- ✅ Manage stream records (create, update, stop)
- ✅ Handle 15-minute reminder cron jobs

**Frontend Responsibilities:**
- ✅ Cloud recording (Agora client-side SDK)
- ✅ Upload recordings to S3 (presigned URLs)
- ✅ Handle live streaming UI

**Simplified Architecture:**
```
Frontend:
- Agora RTC SDK (live streaming)
- Client-side recording
- Direct S3 upload

Backend:
- Token generation (secure)
- Email notifications
- Database management
```

Let me know when you're ready to implement the frontend!
