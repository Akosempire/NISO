# NISO Notification System — Backend API & Integration Spec

## Overview
Multi-channel notification system with email (SendGrid/SES), SMS (Twilio), in-app delivery, queue management, retry logic, and hybrid cloud/local sync.

---

## 1. Environment Configuration

```env
# Email (SendGrid OR AWS SES)
NOTIFICATIONS_EMAIL_PROVIDER=sendgrid  # or 'ses'
SENDGRID_API_KEY=sg_xxxxxxxxxxxx
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# SMS (Twilio)
NOTIFICATIONS_SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Cloud API
CLOUD_API_URL=https://api.niso.ng
CLOUD_API_KEY=niso_key_xxx

# Hybrid Sync
HYBRID_MODE=true
LOCAL_DB_PATH=/data/niso-local.db
SYNC_INTERVAL_MS=30000  # 30 sec
FALLBACK_TO_LOCAL_ON_ERROR=true
```

---

## 2. Database Schema (PostgreSQL)

```sql
-- Notification Queue
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipients JSONB NOT NULL,  -- [{email, phone, userId}]
  channels TEXT[] NOT NULL,   -- ['in_app', 'email', 'sms']
  priority VARCHAR(20),       -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, DELIVERED, FAILED, BOUNCED
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  next_retry TIMESTAMP,
  delivery_results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Notification History
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES notification_queue(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  recipients JSONB,
  channels TEXT[],
  priority VARCHAR(20),
  status VARCHAR(20),
  delivery_results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_created_at (created_at DESC)
);

-- User Notification Preferences
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  interruption_channels TEXT[] DEFAULT ['in_app', 'email', 'sms'],
  sla_warning_channels TEXT[] DEFAULT ['in_app', 'email'],
  approval_channels TEXT[] DEFAULT ['in_app', 'email'],
  month_seal_channels TEXT[] DEFAULT ['in_app', 'email'],
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification Delivery Log (audit trail)
CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notification_queue(id),
  channel VARCHAR(50),  -- in_app, email, sms
  provider VARCHAR(50),  -- sendgrid, ses, twilio
  status VARCHAR(20),    -- success, failed, bounced
  recipient VARCHAR(255),
  error_message TEXT,
  external_id VARCHAR(255),  -- SendGrid/Twilio message ID
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_notification_id (notification_id),
  INDEX idx_created_at (created_at DESC)
);
```

---

## 3. API Endpoints

### POST /api/notifications/queue
Queue a notification for delivery.

```json
Request:
{
  "type": "INTERRUPTION",
  "title": "⚠️ Equipment Down: 2SHR TR1",
  "message": "2SHR TR1 interrupted at 14:32. Cause: Overload",
  "recipients": [
    { "email": "supervisor@niso.ng", "phone": "+234 801 234 5678", "userId": "user-123" }
  ],
  "channels": ["in_app", "email", "sms"],
  "priority": "HIGH",
  "metadata": {
    "equipment": "2SHR TR1",
    "cause": "Overload",
    "recordId": "i-123"
  }
}

Response:
{
  "id": "notif-456",
  "status": "PENDING",
  "queuedAt": "2026-04-08T14:32:00Z",
  "estimatedDeliveryTime": "2026-04-08T14:32:10Z"
}
```

### GET /api/notifications/queue
Get queue status.

```json
Response:
{
  "total": 127,
  "pending": 45,
  "delivered": 78,
  "failed": 4,
  "isOnline": true,
  "lastSync": "2026-04-08T14:32:00Z"
}
```

### GET /api/notifications/history?type=INTERRUPTION&since=2026-04-08
Get notification history with filtering.

```json
Response:
{
  "notifications": [
    {
      "id": "notif-123",
      "type": "INTERRUPTION",
      "title": "⚠️ Equipment Down",
      "message": "...",
      "status": "DELIVERED",
      "deliveredAt": "2026-04-08T14:32:05Z",
      "deliveryResults": {
        "in_app": { "success": true },
        "email": { "success": true, "messageId": "sg_msg_xxx" },
        "sms": { "success": false, "error": "Invalid number" }
      }
    }
  ],
  "total": 245,
  "hasMore": true
}
```

### PUT /api/notifications/:id/acknowledge
Mark a notification as read/acknowledged.

```json
Response:
{
  "id": "notif-123",
  "acknowledged": true,
  "acknowledgedAt": "2026-04-08T14:35:00Z"
}
```

### POST /api/notifications/preferences
Update user notification preferences.

```json
Request:
{
  "email": "operator@niso.ng",
  "phone": "+234 801 234 5678",
  "interruption_channels": ["in_app", "email", "sms"],
  "sla_warning_channels": ["in_app", "email"],
  "approval_channels": ["in_app", "email"],
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "06:00"
}

Response:
{
  "userId": "user-123",
  "preferences": { ... }
}
```

### GET /api/notifications/preferences
Get user notification preferences.

```json
Response:
{
  "userId": "user-123",
  "email": "operator@niso.ng",
  "phone": "+234 801 234 5678",
  "interruption_channels": ["in_app", "email", "sms"],
  ...
}
```

---

## 4. Notification Types & Triggers

### INTERRUPTION
**Trigger**: When equipment interruption is logged
**Recipients**: Supervisor, Station Admin, Regional Admin, HQ Admin
**Channels**: in_app, email, sms
**Template**:
```
⚠️ Equipment Down: {equipment}
{equipment} interrupted at {tripTime}. Cause: {cause}
```

### SLA_WARNING
**Trigger**: When actual MW deviates >5MW from forecast
**Recipients**: Supervisor, Station Admin, Regional Admin
**Channels**: in_app, email
**Template**:
```
⚠️ SLA Alert: Hour {hour}:00
Difference {difference}MW exceeds tolerance. Forecast: {forecast}MW, Actual: {actual}MW
```

### APPROVAL_REQUIRED
**Trigger**: When correction is submitted for approval
**Recipients**: Supervisor (for station scope), Regional Admin (for regional)
**Channels**: in_app, email
**Template**:
```
📋 Approval Pending: {module}
{submittedBy} submitted a {module} correction requiring your approval.
```

### MONTH_SEAL
**Trigger**: When month transitions to SEALED
**Recipients**: All users with station/regional scope
**Channels**: in_app, email
**Template**:
```
🔒 Month Seal: {month}/{year}
Month is now {state}. {recordCount} records affected.
```

### READING_RECORDED
**Trigger**: When new reading is created (optional, low priority)
**Recipients**: Supervisor, Station Admin
**Channels**: in_app
**Template**:
```
✓ Reading Recorded: {equipment}
Hour {hour}:00 — {amp}A, {mw}MW, {kv}KV
```

---

## 5. Email Provider Integration

### SendGrid Implementation

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendViaEmail(notification, recipients) {
  const emails = recipients
    .filter(r => r.email && isEmailValid(r.email))
    .map(r => r.email);

  if (emails.length === 0) return { success: false, error: 'No valid emails' };

  try {
    const msg = {
      to: emails,
      from: 'notifications@niso.ng',
      subject: notification.title,
      html: renderEmailTemplate(notification),
      categories: [notification.type],
      customArgs: {
        notificationId: notification.id,
        type: notification.type
      }
    };

    const response = await sgMail.send(msg);
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      sent: emails.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### AWS SES Implementation

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_SES_REGION });

async function sendViaSES(notification, recipients) {
  const emails = recipients.filter(r => r.email && isEmailValid(r.email));
  if (emails.length === 0) return { success: false, error: 'No valid emails' };

  try {
    const params = {
      Source: 'notifications@niso.ng',
      Destination: { ToAddresses: emails.map(e => e.email) },
      Message: {
        Subject: { Data: notification.title },
        Body: { Html: { Data: renderEmailTemplate(notification) } }
      },
      Tags: [
        { Name: 'notificationType', Value: notification.type },
        { Name: 'notificationId', Value: notification.id }
      ]
    };

    const result = await ses.sendEmail(params).promise();
    return {
      success: true,
      messageId: result.MessageId,
      sent: emails.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 6. SMS Provider Integration (Twilio)

```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendViaSMS(notification, recipients) {
  const phones = recipients
    .filter(r => r.phone && isPhoneValid(r.phone))
    .map(r => r.phone);

  if (phones.length === 0) return { success: false, error: 'No valid phones' };

  try {
    const promises = phones.map(phone =>
      client.messages.create({
        body: notification.message.substring(0, 160),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      })
    );

    const results = await Promise.all(promises);
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      success: failed === 0,
      sent: phones.length - failed,
      failed,
      messageIds: results.map(r => r.sid)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 7. Hybrid Sync Engine

```javascript
class HybridSyncEngine {
  constructor(config) {
    this.cloudUrl = config.cloudUrl;
    this.localDb = config.localDb;
    this.syncInterval = config.syncInterval || 30000;
    this.isOnline = navigator.onLine || true;
    this.syncInProgress = false;

    this.initSync();
  }

  initSync() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    setInterval(() => this.syncQueue(), this.syncInterval);
  }

  async syncQueue() {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    try {
      // Get pending items from local
      const pendingLocal = await this.localDb.getPendingNotifications();
      
      if (pendingLocal.length === 0) {
        this.syncInProgress = false;
        return;
      }

      // Try to sync to cloud
      const response = await fetch(`${this.cloudUrl}/api/notifications/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({ notifications: pendingLocal })
      });

      if (response.ok) {
        const result = await response.json();
        // Mark as synced locally
        await this.localDb.markSynced(result.syncedIds);
        console.log(`[Sync] Synced ${result.syncedIds.length} notifications to cloud`);
      } else if (this.fallbackToLocal) {
        console.warn('[Sync] Cloud unavailable, staying local');
      }
    } catch (error) {
      console.error('[Sync] Error:', error.message);
      if (!this.fallbackToLocal) throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  handleOnline() {
    console.log('[Sync] Coming online');
    this.isOnline = true;
    this.syncQueue();
  }

  handleOffline() {
    console.log('[Sync] Going offline');
    this.isOnline = false;
  }

  getToken() {
    // Retrieve auth token from localStorage or session
    return localStorage.getItem('niso_auth_token') || '';
  }
}
```

---

## 8. Queue Processor (Background Job)

```javascript
// Bull queue for background processing
const Queue = require('bull');
const notificationQueue = new Queue('notifications', process.env.REDIS_URL);

notificationQueue.process(5, async (job) => {
  const { notificationId } = job.data;
  const notification = await Notification.findById(notificationId);

  try {
    const results = {};

    // In-app
    if (notification.channels.includes('in_app')) {
      results.in_app = await deliverInApp(notification);
    }

    // Email
    if (notification.channels.includes('email')) {
      results.email = await deliverEmail(notification);
    }

    // SMS
    if (notification.channels.includes('sms')) {
      results.sms = await deliverSMS(notification);
    }

    // Update status
    if (Object.values(results).every(r => r.success)) {
      notification.status = 'DELIVERED';
    } else if (job.attemptsMade < notification.maxAttempts) {
      // Retry with exponential backoff
      throw new Error('Partial delivery, retrying...');
    } else {
      notification.status = 'FAILED';
    }

    notification.deliveryResults = results;
    notification.updatedAt = new Date();
    await notification.save();

    return { success: true, results };
  } catch (error) {
    if (job.attemptsMade < notification.maxAttempts) {
      throw error;  // Retry
    } else {
      notification.status = 'FAILED';
      notification.error = error.message;
      await notification.save();
      return { success: false, error: error.message };
    }
  }
});

// Add job to queue
async function queueNotification(notification) {
  await notificationQueue.add(
    { notificationId: notification.id },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true
    }
  );
}
```

---

## 9. Testing Checklist

- [ ] Send interruption to all roles
- [ ] Send SLA warning (email + in-app)
- [ ] Send approval request (Supervisor receives)
- [ ] Send month seal notice (all roles)
- [ ] Test offline → online sync
- [ ] Test email bounce handling
- [ ] Test SMS with invalid number
- [ ] Test quiet hours suppression
- [ ] Verify audit trail in notification_delivery_log
- [ ] Test hybrid cloud/local fallback
- [ ] Verify retry with exponential backoff
- [ ] Load test: 1000+ notifications queued

---

## 10. Deployment Checklist

- [ ] Configure SendGrid OR AWS SES API keys
- [ ] Configure Twilio credentials
- [ ] Set up Redis for Bull queue
- [ ] Create PostgreSQL tables
- [ ] Deploy background job processor
- [ ] Test end-to-end with test numbers
- [ ] Set up CloudWatch/monitoring for queue depth
- [ ] Document SMS opt-out for users
- [ ] Set up email template versioning
- [ ] Configure webhook for bounces/complaints

---

**Owner**: DevOps Team  
**Status**: Ready for integration  
**Last Updated**: 2026-04-08
