# NISO API Quick Reference

Fast lookup for developers integrating with NISO backend.

---

## Authentication

### Login
```
POST /api/auth/login
{
  "email": "operator@station.local",
  "password": "secure_password"
}
→ { "token": "eyJhbGc...", "user": { "id": 1, "role": "Supervisor", "station_id": 5 } }
```

### Refresh Token
```
POST /api/auth/refresh
Header: Authorization: Bearer {token}
→ { "token": "new_token" }
```

### Logout
```
POST /api/auth/logout
Header: Authorization: Bearer {token}
→ { "success": true }
```

---

## Readings (Core Operations)

### Create Reading
```
POST /api/readings
{
  "equipment_id": 1,
  "data": {
    "amperage": 450.5,
    "mw": 750.2,
    "mvar": 320.1,
    "voltage": 138.5
  }
}
→ { "id": 1234, "synced_at": "2026-05-17T10:30:00Z" }
```

### Fetch Readings
```
GET /api/readings?equipment_id=1&start_date=2026-05-10&end_date=2026-05-17
→ [
  { "id": 1234, "equipment_id": 1, "data": {...}, "timestamp": "2026-05-17T10:30:00Z" },
  ...
]
```

### Bulk Sync (Offline)
```
POST /api/readings/bulk-sync
[
  { "equipment_id": 1, "data": {...} },
  { "equipment_id": 2, "data": {...} }
]
→ { "synced": 2, "failed": 0 }
```

### Update Reading
```
PUT /api/readings/1234
{
  "data": {
    "amperage": 451.0,
    "mw": 750.5
  }
}
→ { "id": 1234, "updated_at": "2026-05-17T10:35:00Z" }
```

### Delete Reading
```
DELETE /api/readings/1234
→ { "deleted": true }
```

---

## Equipment

### List Equipment (Scoped)
```
GET /api/equipment
→ [
  {
    "id": 1,
    "name": "2SHR TR1",
    "station_id": 5,
    "status": "operating",
    "sla": 98.5,
    "uptime": 99.2
  },
  ...
]
```

### Equipment Detail
```
GET /api/equipment/1
→ {
  "id": 1,
  "name": "2SHR TR1",
  "type": "turbine",
  "template_id": 10,
  "readings_count": 720,
  "last_reading": "2026-05-17T10:30:00Z",
  "history": [ ... ]
}
```

### Real-Time Status
```
GET /api/equipment/1/status
→ {
  "id": 1,
  "status": "operating",
  "sla_current": 98.5,
  "uptime_24h": 99.2,
  "last_alert": null
}
```

### Create Equipment
```
POST /api/equipment
{
  "name": "2SHR TR4",
  "station_id": 5,
  "template_id": 10
}
→ { "id": 4, "name": "2SHR TR4", "created_at": "2026-05-17T10:30:00Z" }
```

### Update Equipment
```
PUT /api/equipment/1
{
  "status": "alert",
  "template_id": 11
}
→ { "id": 1, "updated_at": "2026-05-17T10:30:00Z" }
```

---

## SLA & Forecasts

### SLA Trend (for charts)
```
GET /api/sla?station_id=5&days=30
→ [
  {
    "date": "2026-04-17",
    "equipment_id": 1,
    "forecast": 95.5,
    "actual": 95.2,
    "variance": -0.3
  },
  ...
]
```

### Equipment SLA Detail
```
GET /api/sla/1
→ {
  "equipment_id": 1,
  "current_sla": 98.5,
  "target_sla": 95.0,
  "variance": 3.5,
  "trend_7d": [95.2, 95.5, 96.1, ...],
  "alert_level": "green"
}
```

### Update Forecast
```
PUT /api/sla/1
{
  "forecast_percentage": 96.5
}
→ { "equipment_id": 1, "forecast": 96.5, "updated_at": "2026-05-17T10:30:00Z" }
```

### Recalculate Variance
```
POST /api/sla/recalculate
{
  "station_id": 5,
  "date": "2026-05-17"
}
→ { "recalculated": 12, "updated_at": "2026-05-17T10:30:00Z" }
```

---

## Templates

### List Templates
```
GET /api/templates?scope=station
→ [
  {
    "id": 10,
    "name": "2SHR Hourly",
    "version": 2,
    "status": "PUBLISHED",
    "field_count": 4
  },
  ...
]
```

### Get Template
```
GET /api/templates/10
→ {
  "id": 10,
  "name": "2SHR Hourly",
  "fields": [
    {
      "id": "f1",
      "name": "Amperage (AMP)",
      "type": "number",
      "required": true,
      "validation": { "min": 0, "max": 999 }
    },
    ...
  ],
  "version": 2,
  "status": "PUBLISHED"
}
```

### Create Template
```
POST /api/templates
{
  "name": "New Transformer",
  "description": "New equipment readings",
  "fields": [
    {
      "name": "Amperage",
      "type": "number",
      "required": true,
      "validation": { "min": 0, "max": 999 }
    }
  ],
  "scope": "station"
}
→ { "id": 11, "version": 1, "status": "DRAFT" }
```

### Update Template (Auto-version)
```
PUT /api/templates/10
{
  "fields": [ ... ] /* updated fields */
}
→ { "id": 10, "version": 3, "status": "DRAFT" }
```

### Publish Template
```
POST /api/templates/10/publish
→ { "id": 10, "status": "PUBLISHED", "version": 3 }
```

### Version History
```
GET /api/templates/10/versions
→ [
  { "version": 3, "status": "PUBLISHED", "created_at": "2026-05-17T10:30:00Z" },
  { "version": 2, "status": "PUBLISHED", "created_at": "2026-05-16T14:20:00Z" },
  { "version": 1, "status": "PUBLISHED", "created_at": "2026-05-15T09:00:00Z" }
]
```

### Rollback Version
```
POST /api/templates/10/rollback
{
  "version": 2
}
→ { "id": 10, "version": 2, "status": "DRAFT" }
```

---

## Alerts & Thresholds

### Fetch Alerts
```
GET /api/alerts?severity=critical&limit=20
→ [
  {
    "id": 1,
    "equipment_id": 2,
    "alert_type": "SLA",
    "severity": "critical",
    "message": "SLA below 90%",
    "created_at": "2026-05-17T10:30:00Z",
    "acknowledged_at": null
  },
  ...
]
```

### Acknowledge Alert
```
POST /api/alerts/1/acknowledge
→ { "id": 1, "acknowledged_at": "2026-05-17T10:35:00Z" }
```

### Dismiss Alert
```
DELETE /api/alerts/1
→ { "deleted": true }
```

### Get Threshold Config
```
GET /api/alerts/thresholds
→ {
  "sla_critical": 90,
  "sla_warning": 93,
  "uptime_critical": 85,
  "uptime_warning": 90
}
```

### Update Thresholds
```
PUT /api/alerts/thresholds
{
  "sla_critical": 88,
  "sla_warning": 92
}
→ { "updated": 2, "applied_at": "2026-05-17T10:30:00Z" }
```

---

## Audit & Compliance

### Audit Log
```
GET /api/audit-log?user_id=1&action=create&days=30
→ [
  {
    "id": 1,
    "user_id": 1,
    "action": "create",
    "resource_type": "reading",
    "resource_id": 1234,
    "details": { "amperage": 450.5 },
    "created_at": "2026-05-17T10:30:00Z"
  },
  ...
]
```

### Month Seals
```
GET /api/month-seals?station_id=5&year=2026&month=5
→ {
  "id": 1,
  "station_id": 5,
  "year": 2026,
  "month": 5,
  "status": "OPEN", /* OPEN, REVIEW, SEALED */
  "sealed_by": null,
  "sealed_at": null
}
```

### Seal Month
```
POST /api/month-seals/1/seal
→ { "id": 1, "status": "SEALED", "sealed_at": "2026-05-17T10:30:00Z" }
```

---

## Reports & Export

### SLA Trend Export
```
GET /api/reports/sla-trend?format=json&days=30&station_id=5
→ [
  { "date": "2026-04-17", "equipment": "2SHR TR1", "sla": 95.2 },
  ...
]
```

### CSV Export
```
GET /api/reports/sla-trend?format=csv&days=30
→ File download (text/csv)
```

### Generate PDF
```
POST /api/reports/generate-pdf
{
  "type": "daily-sla",
  "format": "pdf",
  "recipient": "operator@station.local"
}
→ { "job_id": "pdf-12345", "status": "queued" }
```

### Fetch PDF
```
GET /api/reports/pdf/pdf-12345
→ File download (application/pdf)
```

---

## Email Reports

### Schedule Report
```
POST /api/email-reports
{
  "report_type": "daily-sla",
  "recipient_email": "op@station.local",
  "schedule": "09:00" /* or "every-monday", "first-of-month" */
}
→ { "id": 1, "status": "active", "next_send": "2026-05-18T09:00:00Z" }
```

### List Scheduled Reports
```
GET /api/email-reports
→ [
  { "id": 1, "report_type": "daily-sla", "schedule": "09:00", "active": true },
  ...
]
```

### Update Schedule
```
PUT /api/email-reports/1
{
  "schedule": "14:00"
}
→ { "id": 1, "schedule": "14:00", "next_send": "2026-05-18T14:00:00Z" }
```

### Send Immediately
```
POST /api/email-reports/1/send-now
→ { "sent_to": "op@station.local", "sent_at": "2026-05-17T10:30:00Z" }
```

---

## WebSocket Events

### Subscribe to Equipment
```javascript
socket.emit('subscribe', { equipment_id: 1 })
```

### Receive Updates
```javascript
socket.on('sla:refresh', (data) => {
  // { equipment_id: 1, sla: 98.5, updated_at: "..." }
})

socket.on('alert:new', (alert) => {
  // { id: 1, equipment_id: 2, severity: "critical", ... }
})

socket.on('status:change', (status) => {
  // { equipment_id: 1, status: "operating" }
})

socket.on('users:online', (info) => {
  // { count: 45, list: [{ user_id: 1, role: "Supervisor" }, ...] }
})
```

### Send Events
```javascript
socket.emit('alert:ack', { alert_id: 1 })
socket.emit('reading:create', { equipment_id: 1, data: {...} })
socket.emit('heartbeat', { user_id: 1 })
```

---

## Error Handling

All errors return standard format:

```json
{
  "error": true,
  "code": "UNAUTHORIZED",
  "message": "Invalid token",
  "status": 401
}
```

### Common Codes
- `UNAUTHORIZED` (401) — Missing/expired token
- `FORBIDDEN` (403) — Insufficient permissions
- `NOT_FOUND` (404) — Resource doesn't exist
- `VALIDATION_ERROR` (400) — Invalid request body
- `CONFLICT` (409) — Month sealed, can't edit
- `RATE_LIMIT` (429) — Too many requests
- `SERVER_ERROR` (500) — Unexpected error

---

## Rate Limits

- **API** — 100 req/min per IP
- **WebSocket** — 1000 events/min per user
- **Upload** — 100 MB max file size

---

## Pagination

List endpoints support:
```
GET /api/readings?page=1&limit=50&sort=-timestamp
```

Response:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1200,
    "pages": 24
  }
}
```

---

## Timestamps

All timestamps in ISO 8601 format:
```
2026-05-17T10:30:00Z
```

---

## Required Headers

```
Content-Type: application/json
Authorization: Bearer {token}
User-Agent: NISO-Client/1.0
```

---

**Last updated:** 2026-05-17
