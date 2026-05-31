# NISO API Specification

## Base URL

```
Development: http://localhost:3001/api
Staging: https://api-staging.niso.tcn.ng/api
Production: https://api.niso.tcn.ng/api
```

## Authentication

All endpoints (except `/auth/login` and `/health`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "operator@station.ng",
  "password": "secure_password"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "operator@station.ng",
    "fullName": "John Doe",
    "role": { "name": "OPERATOR" },
    "station": { "id": "stn_456", "name": "Lekki Station" }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <EXPIRED_TOKEN>

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>

Response 204: No Content
```

---

## Readings

### Create Reading

```http
POST /api/stations/:stationId/readings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "equipmentId": "eq_789",
  "date": "2024-01-15",
  "hour": 14,
  "rawInput": "330.5",
  "valueType": "number",
  "remarks": "Normal operation"
}

Response 201:
{
  "id": "read_001",
  "equipmentId": "eq_789",
  "stationId": "stn_456",
  "date": "2024-01-15T00:00:00Z",
  "hour": 14,
  "rawInput": "330.5",
  "numericValue": 330.5,
  "valueType": "number",
  "createdBy": { "id": "user_123", "email": "operator@station.ng" },
  "createdAt": "2024-01-15T14:30:00Z",
  "sealedAt": null,
  "formulaId": null
}
```

### Get Readings

```http
GET /api/stations/:stationId/readings?date=2024-01-15&hour=14&sealed=false
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": "read_001",
      "equipmentId": "eq_789",
      "date": "2024-01-15T00:00:00Z",
      "hour": 14,
      "rawInput": "330.5",
      "numericValue": 330.5,
      "sealedAt": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Query Parameters**:
- `date`: ISO string (YYYY-MM-DD)
- `hour`: 0-23
- `sealed`: boolean (null = editable, filled = sealed)
- `limit`: 1-100 (default 50)
- `offset`: 0-based pagination

### Update Reading

```http
PUT /api/readings/:readingId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "rawInput": "330.7",
  "remarks": "Corrected value"
}

Response 200:
{
  "id": "read_001",
  "rawInput": "330.7",
  "numericValue": 330.7,
  "updatedAt": "2024-01-15T14:35:00Z"
}

Error 403: Cannot update sealed reading
Error 409: Duplicate entry for this hour/equipment
```

### Seal Reading

```http
POST /api/readings/:readingId/seal
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": "read_001",
  "sealedAt": "2024-01-15T14:40:00Z"
}

Error 403: Only Station Admin can seal
Error 409: Already sealed
```

### Delete Reading

```http
DELETE /api/readings/:readingId
Authorization: Bearer <JWT_TOKEN>

Response 204: No Content

Error 403: Cannot delete sealed reading
```

---

## SLA Entries

### Create SLA Entry

```http
POST /api/stations/:stationId/sla
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "date": "2024-01-15",
  "hour": 14,
  "forecastMw": 1200.5,
  "actualMw": 1210.2,
  "meterReadingKwh": 12345.67,
  "remarks": "Load dispatch provided forecast"
}

Response 201:
{
  "id": "sla_123",
  "stationId": "stn_456",
  "date": "2024-01-15T00:00:00Z",
  "hour": 14,
  "forecastMw": 1200.5,
  "actualMw": 1210.2,
  "differenceMw": 9.7,
  "meterReadingKwh": 12345.67,
  "approvedAt": null,
  "sealedAt": null,
  "createdAt": "2024-01-15T14:30:00Z"
}
```

### Get SLA Entries

```http
GET /api/stations/:stationId/sla?date=2024-01-15&approved=false
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": "sla_123",
      "date": "2024-01-15T00:00:00Z",
      "hour": 14,
      "forecastMw": 1200.5,
      "actualMw": 1210.2,
      "differenceMw": 9.7,
      "approvedAt": null
    }
  ],
  "total": 24,
  "page": 1
}
```

### Approve SLA Entry

```http
POST /api/sla/:entryId/approve
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": "sla_123",
  "approvedAt": "2024-01-15T15:00:00Z",
  "approvedBy": "user_456"
}

Error 403: Only Station Admin+ can approve
```

---

## Interruptions

### Create Interruption

```http
POST /api/equipment/:equipmentId/interruptions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tripTime": "2024-01-15T14:30:00Z",
  "restorationTime": "2024-01-15T14:45:00Z",
  "causeCode": "RELAY_FLT",
  "notes": "Relay protection operated on 330kV circuit"
}

Response 201:
{
  "id": "intr_001",
  "equipmentId": "eq_789",
  "tripTime": "2024-01-15T14:30:00Z",
  "restorationTime": "2024-01-15T14:45:00Z",
  "causeCode": "RELAY_FLT",
  "durationSeconds": 900,
  "status": "Active",
  "createdAt": "2024-01-15T14:30:15Z"
}
```

**Cause Codes**:
- `RELAY_FLT`: Relay protection fault
- `CB_FLT`: Circuit breaker fault
- `TRIP_MANUAL`: Manual trip
- `MNT`: Maintenance
- `AUTO_RECLOSE`: Auto-reclosure failure
- `HARDWARE_FLT`: Hardware failure

### Get Active Interruptions

```http
GET /api/interruptions?status=Active&stationId=stn_456
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": "intr_001",
      "equipmentId": "eq_789",
      "equipment": { "name": "330kV Circuit 1" },
      "tripTime": "2024-01-15T14:30:00Z",
      "durationSeconds": 900,
      "causeCode": "RELAY_FLT",
      "status": "Active"
    }
  ],
  "total": 3
}
```

### Resolve Interruption

```http
POST /api/interruptions/:interruptionId/resolve
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "restorationTime": "2024-01-15T14:45:00Z"
}

Response 200:
{
  "id": "intr_001",
  "status": "Resolved",
  "durationSeconds": 900,
  "resolvedAt": "2024-01-15T14:46:00Z"
}
```

---

## Inspections

### Create Inspection

```http
POST /api/equipment/:equipmentId/inspections
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "inspectionDate": "2024-01-15",
  "typeId": "routine",
  "findings": {
    "oilLevel": "Normal",
    "temperature": 45.2,
    "visualDefects": "None observed"
  },
  "photos": [
    "s3://bucket/photo1.jpg",
    "s3://bucket/photo2.jpg"
  ]
}

Response 201:
{
  "id": "insp_001",
  "equipmentId": "eq_789",
  "inspectionDate": "2024-01-15T00:00:00Z",
  "typeId": "routine",
  "findings": { ... },
  "photos": [ ... ],
  "approvedAt": null
}
```

---

## Templates

### Create Template

```http
POST /api/stations/:stationId/templates
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "330kV Daily Readings",
  "fields": [
    {
      "id": "voltage",
      "label": "Voltage (kV)",
      "type": "number",
      "unit": "kV",
      "required": true,
      "min": 300,
      "max": 360
    },
    {
      "id": "frequency",
      "label": "Frequency (Hz)",
      "type": "number",
      "unit": "Hz",
      "min": 49.5,
      "max": 50.5
    },
    {
      "id": "status",
      "label": "Status",
      "type": "code",
      "codes": ["ON", "OFF", "O/S", "TEST"],
      "required": true
    }
  ]
}

Response 201:
{
  "id": "tpl_001",
  "stationId": "stn_456",
  "name": "330kV Daily Readings",
  "fields": [ ... ]
}
```

### Get Templates

```http
GET /api/stations/:stationId/templates
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": "tpl_001",
      "name": "330kV Daily Readings",
      "fields": [ ... ]
    }
  ]
}
```

---

## Reports

### Generate Report

```http
POST /api/reports/generate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "type": "daily_readings",
  "dateRangeStart": "2024-01-01",
  "dateRangeEnd": "2024-01-31",
  "stationId": "stn_456",
  "format": "excel"
}

Response 201:
{
  "id": "rpt_001",
  "name": "Daily Readings - Lekki Station (Jan 2024)",
  "type": "daily_readings",
  "generatedAt": "2024-01-31T16:00:00Z",
  "dataUrl": "s3://bucket/report_001.xlsx",
  "expiresAt": "2024-02-14T16:00:00Z"
}
```

**Report Types**:
- `daily_readings`: Hourly readings for a day
- `sla`: SLA summary with forecast vs actual
- `interruption`: Interruption analysis (cause, duration, frequency)
- `inspection`: Inspection schedule + findings
- `monthly`: Monthly summary (all metrics)

**Formats**:
- `excel`: XLSX with formulas
- `pdf`: Multi-page formatted report
- `csv`: Comma-separated values

### Get Report

```http
GET /api/reports/:reportId
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "id": "rpt_001",
  "name": "Daily Readings - Lekki Station (Jan 2024)",
  "dataUrl": "s3://bucket/report_001.xlsx",
  "expiresAt": "2024-02-14T16:00:00Z"
}
```

### Download Report

```http
GET /api/reports/:reportId/download
Authorization: Bearer <JWT_TOKEN>

Response 200: (File download)
```

---

## Admin

### Get Audit Logs

```http
GET /api/admin/audit-logs?action=update&resourceType=reading&userId=user_123&dateStart=2024-01-01&dateEnd=2024-01-31
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "data": [
    {
      "id": "audit_001",
      "action": "update",
      "resourceType": "reading",
      "resourceId": "read_001",
      "oldValue": { "rawInput": "330.5" },
      "newValue": { "rawInput": "330.7" },
      "user": { "id": "user_123", "email": "operator@station.ng" },
      "ipAddress": "192.168.1.5",
      "createdAt": "2024-01-15T14:35:00Z"
    }
  ],
  "total": 150
}
```

### Create User

```http
POST /api/admin/users
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email": "newoperator@station.ng",
  "fullName": "Jane Smith",
  "phoneNumber": "+234812345678",
  "role": "OPERATOR",
  "stationId": "stn_456"
}

Response 201:
{
  "id": "user_789",
  "email": "newoperator@station.ng",
  "fullName": "Jane Smith",
  "role": { "name": "OPERATOR" },
  "station": { "name": "Lekki Station" },
  "createdAt": "2024-01-15T15:00:00Z"
}
```

### Update User

```http
PUT /api/admin/users/:userId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fullName": "Jane Smith Updated",
  "role": "STATION_ADMIN"
}

Response 200:
{
  "id": "user_789",
  "email": "newoperator@station.ng",
  "fullName": "Jane Smith Updated",
  "role": { "name": "STATION_ADMIN" }
}
```

### Delete User

```http
DELETE /api/admin/users/:userId
Authorization: Bearer <JWT_TOKEN>

Response 204: No Content
```

---

## Health & Status

```http
GET /api/health

Response 200:
{
  "status": "healthy",
  "timestamp": "2024-01-15T15:00:00Z",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "s3": "ok"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error detail"
  },
  "timestamp": "2024-01-15T15:00:00Z"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Example Error

```http
POST /api/readings/:readingId/seal
Response 409:

{
  "error": "Cannot seal reading that is already sealed",
  "code": "ALREADY_SEALED",
  "timestamp": "2024-01-15T15:00:00Z"
}
```

---

**API Version**: 1.0  
**Last Updated**: 2024-01-15  
**Next Version**: 1.1 (Q2 2024)
