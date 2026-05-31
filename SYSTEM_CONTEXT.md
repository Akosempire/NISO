# NISO System Architecture & Context

**NISO** = Nigerian Independent System Operator  
**Built for**: TCN (Transmission Company of Nigeria)  
**Purpose**: Eliminate duplicate data entry, manual calculations, and operational inefficiencies across all electricity transmission stations

---

## Executive Summary

NISO is a **production-grade web application** that centralizes hourly operational readings, SLA tracking, interruption logging, and equipment inspections across TCN's regional station network. The system replaces scattered spreadsheets, manual phone reporting, and fragmented databases with a unified, audit-safe, role-based operational hub.

### Key Problems Solved

| Problem | NISO Solution |
|---------|---------------|
| Operators enter same data into 3+ systems | Single input form syncs to all downstream consumers |
| SLA calculations done manually in Excel | Auto-calculated, version-controlled formulas |
| Interruptions tracked on paper/WhatsApp | Timestamp-locked incident logs with cause tracking |
| No audit trail of who changed what | Complete audit log with before/after values + IP |
| Regional admin has no station visibility | Real-time multi-station dashboard with drill-down |
| Headquarters blind to field operations | National overview with exception alerts + exports |
| Templates hard-coded, inflexible | Admin-defined templates with dynamic formulas |
| Data lost when network drops | Offline input + auto-sync when connection restored |

---

## Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Frontend (React + TypeScript)               â”‚
â”‚  â€¢ Role-based sidebar navigation                                â”‚
â”‚  â€¢ Template-driven input forms                                  â”‚
â”‚  â€¢ Real-time multi-station dashboards                           â”‚
â”‚  â€¢ Export builders (Excel, PDF, CSV)                            â”‚
â”‚  â€¢ Offline queue + sync engine                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚ (JWT auth, REST/WS)
                           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                Backend (Node.js + Express)                      â”‚
â”‚  â€¢ Authentication & role-based middleware                       â”‚
â”‚  â€¢ CRUD services (Reading, SLA, Interruption, Inspection)       â”‚
â”‚  â€¢ Formula evaluation engine                                    â”‚
â”‚  â€¢ Audit logging + compliance tracking                          â”‚
â”‚  â€¢ Report generation & export                                   â”‚
â”‚  â€¢ WebSocket for real-time interruption feeds                   â”‚
â”‚  â€¢ File upload (S3) + processing queue (Bull)                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚ (SQL queries, transactions)
                           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚             PostgreSQL + Redis (Data & Cache)                   â”‚
â”‚  â€¢ Reading (hourly meter values, sealed records)                â”‚
â”‚  â€¢ SLAEntry (forecast vs actual, approvals)                     â”‚
â”‚  â€¢ Interruption (trip time, duration, cause code)               â”‚
â”‚  â€¢ Inspection (checklist + photo gallery)                       â”‚
â”‚  â€¢ Template (dynamic field definitions + formulas)              â”‚
â”‚  â€¢ AuditLog (compliance trail, immutable)                       â”‚
â”‚  â€¢ User + Role + Station + Region (hierarchy)                   â”‚
â”‚  â€¢ SharingGrant (time-limited data access)                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Data Model (Core Entities)

### User & Role Hierarchy

```
User
â”œâ”€â”€ Role: Operator | StationAdmin | RegionalAdmin | HQAdmin | KnowledgeAdmin | Viewer
â”œâ”€â”€ Region (nullable, for regional admins)
â”œâ”€â”€ Station (nullable, for operators/station admins)
â””â”€â”€ Permissions: { canRead, canCreate, canUpdate, canDelete, canApprove, canSeal }
```

### Operational Data Flow

```
Equipment (type: 330kV, 132kV, Transformer, Feeder)
â”œâ”€â”€ Reading (date, hour, rawInput â†’ numericValue OR codeReference)
â”‚   â”œâ”€â”€ sealedAt (null = editable, filled = immutable)
â”‚   â”œâ”€â”€ formula (optional, for auto-calculated fields)
â”‚   â””â”€â”€ auditLog (every change tracked)
â”œâ”€â”€ SLAEntry (forecast, actualMW, difference, approvalStatus)
â”œâ”€â”€ Interruption (tripTime, restorationTime, causeCode, durationSeconds)
â””â”€â”€ Inspection (template, findings, photos, approvalStatus)
```

### Template & Formula System

```
Template (per station, e.g., "330kV Daily Readings")
â”œâ”€â”€ Fields: [
â”‚   { id: "voltage", label: "Voltage (kV)", type: "number", unit: "kV", required: true },
â”‚   { id: "frequency", label: "Frequency (Hz)", type: "number", unit: "Hz" },
â”‚   { id: "status", label: "Status", type: "code", codes: ["ON", "OFF", "O/S", "TEST"] }
â”‚ ]
â””â”€â”€ Formula: [
â”‚   { name: "Apparent Power", expression: "=(voltage * current) / 1000", version: 1, isActive: true },
â”‚   { name: "Power Factor", expression: "=realPower / apparentPower", version: 1 }
â”‚ ]
```

---

## Role Permissions Matrix

| Action | Operator | StationAdmin | RegionalAdmin | HQAdmin | KnowledgeAdmin | Viewer |
|--------|----------|--------------|---------------|---------|----------------|--------|
| Create Reading | âœ“ | âœ“ | âœ“ (multi-stn) | âœ“ (all) | â€” | â€” |
| Seal Reading | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Approve SLA | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Create Interruption | âœ“ | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Resolve Interruption | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Create Inspection | âœ“ | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Approve Inspection | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| View Station Data | âœ“ (own) | âœ“ (own) | âœ“ (region) | âœ“ (all) | â€” | âœ“ (read-only) |
| View Audit Logs | â€” | âœ“ (own) | âœ“ (region) | âœ“ (all) | â€” | â€” |
| Create Template | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Create/Publish Document | â€” | â€” | â€” | â€” | âœ“ | â€” |
| Generate Report | âœ“ | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Export Report | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |
| Create User | â€” | â€” | âœ“ (region) | âœ“ (all) | â€” | â€” |
| View Settings | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” |

---

## Key Features (MVP Phase 1)

### 1. Readings Module
- **Input**: Hourly meter readings (320 readings/day per station Ã— ~200 stations = 64k readings)
- **Validation**: Against equipment template (numeric bounds, code validation)
- **Sealing**: Once approved by StationAdmin, reading becomes immutable
- **Formulas**: Auto-calculate derived values (power factor, apparent power, etc.)
- **Offline**: Queue readings locally, sync on reconnect

### 2. SLA Module
- **Input**: Forecast (MW) + Actual generation (MW) per hour
- **Auto-Calc**: Difference = Actual - Forecast
- **Alerts**: If |Difference| > 50 MW, notify HQ
- **Approval**: StationAdmin approves, HQ reviews
- **Sealing**: Approved entries become historical records

### 3. Interruption Tracking
- **Input**: Trip time, restoration time, cause code, duration (auto-calculated)
- **Status**: Active â†’ Resolved â†’ Cleared
- **Query**: Find all unresolved interruptions across network
- **Analysis**: Duration histogram, cause code frequency

### 4. Inspections
- **Template**: Admin defines inspection checklist per equipment type
- **Input**: Findings (free-form text or structured), photo upload
- **Approval**: Evidence-based sign-off
- **Archive**: Historical inspection record

### 5. Multi-Station Dashboard
- **RegionalAdmin view**: All stations in region, side-by-side status
- **HQAdmin view**: National map, exception alerts, key metrics
- **Real-time**: Unfilled readings, unresolved interruptions, pending approvals

### 6. Reporting & Exports
- **Types**: Daily readings, SLA summary, interruption analysis, inspection schedule
- **Formats**: Excel (with formulas intact), PDF, CSV
- **Scheduling**: Generate weekly/monthly reports automatically
- **Sharing**: Time-limited, role-aware access to reports

### 7. Audit Logging
- **What**: Every create/update/delete/approve/seal action
- **Who**: User ID, email, timestamp, IP address
- **How**: Before/after values (JSON), query context
- **Access**: HQAdmin can query audit logs by resource/user/date range

### 8. User Management
- **Create/Update/Delete**: HQAdmin or RegionalAdmin (within region)
- **Password**: Hashed (bcrypt), reset via email
- **Last Login**: Track for activity reports
- **Deactivation**: Soft-delete (keep audit trail)

---

## Data Security & Compliance

### Immutability (Sealed Records)

Once a Reading is sealed (approved by StationAdmin):
- `sealedAt` timestamp is set to non-null
- Database constraint prevents UPDATE if `sealedAt IS NOT NULL`
- Any correction requires new Reading entry + audit note

This ensures:
- Regulatory compliance (no retroactive data changes)
- Accountability (audit trail shows corrections)
- Data integrity (historical records unchangeable)

### Audit Trail

Every operational data change logged:

```sql
INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_value, new_value, ip_address, created_at)
VALUES ('user_123', 'update', 'reading', 'read_456', '{"rawInput":"98.5"}', '{"rawInput":"98.7"}', '192.168.1.5', NOW());
```

**Actions tracked**:
- create, update, delete, seal, approve, export, share

**Compliance**:
- 7-year retention (configurable)
- Queryable by user/date/resource
- Exportable for audits

### Access Control (RBAC)

Every request validated:
1. **Authentication**: JWT token (HS256, 24h expiry)
2. **Authorization**: Middleware checks role + resource ownership
3. **Scope**: Operators see own station only; RegionalAdmins see region; HQAdmins see all

Example:
```typescript
// Only StationAdmin of that station can approve
const canApprove = (userId, readingId) => {
  const reading = await prisma.reading.findUnique({ where: { id: readingId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user.role === 'STATION_ADMIN' && user.stationId === reading.stationId;
};
```

### Data Encryption

- **In Transit**: HTTPS/TLS 1.3 (all endpoints)
- **At Rest**: RDS encryption enabled (AES-256)
- **Passwords**: Salted bcrypt (cost factor 12)
- **Secrets**: AWS Secrets Manager (JWT secret, DB credentials, S3 keys)

---

## Offline-First Architecture

### Problem
Stations often lack reliable internet (especially in remote regions). Operators need to enter readings without network connectivity.

### Solution

1. **Local Storage**: Browser stores readings locally in IndexedDB/localStorage
2. **Sync Queue**: When offline, queue reads in `localStorage.syncQueue`
3. **Auto-Sync**: When connection restored, push queue to backend
4. **Conflict Resolution**: 
   - If reading was updated remotely after local modification, show user conflict UI
   - User chooses: keep local, use remote, or merge

```typescript
// Client-side sync
const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
for (const item of syncQueue) {
  try {
    await apiClient.post('/readings', item);
    // Remove from queue
  } catch (error) {
    // Keep in queue, retry later
  }
}
localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
```

---

## Template System & Formulas

### Why Templates?

Different equipment types have different readings:
- **330kV Transmission Line**: Voltage, Current, Frequency, Phase Angle
- **Transformer**: Primary Voltage, Secondary Voltage, Load %, Oil Temp
- **Generator**: MW output, MVAR, Power Factor, Rotor Temp
- **Substation**: Multiple circuits, switches, capacitors

**Admin-defined templates** allow flexibility without code changes.

### Formula Engine

Uses `mathjs` for safe expression evaluation:

```typescript
Template: "330kV Daily"
Fields: [
  { id: "voltage", type: "number", unit: "kV" },
  { id: "current", type: "number", unit: "A" }
]
Formula: [
  { name: "Apparent Power (MVA)", expression: "=(voltage * current * 1.732) / 1000", version: 1, isActive: true }
]

// Evaluation context: { voltage: 330, current: 100 }
// Result: (330 * 100 * 1.732) / 1000 = 57.156 MVA
```

**Safety**: Formulas are compiled/validated on create, not at runtime.

---

## Integration Points (Future Phases)

### SCADA Integration

TCN operates SCADA systems that collect real-time meter data. NISO can:
1. **Ingest**: Poll SCADA API hourly for meter readings
2. **Pre-fill**: Auto-populate reading forms with SCADA data
3. **Validate**: Flag manual entries that deviate >10% from SCADA

```typescript
// Future: Sync with SCADA
const scadaReading = await scadaClient.getMeterReading(equipmentId, timestamp);
const suggestedReading = await Reading.create({
  equipmentId,
  timestamp,
  rawInput: scadaReading.value,
  source: 'SCADA', // vs 'MANUAL'
  requiresApproval: Math.abs(scadaReading.value - manualValue) > 0.1 * scadaReading.value
});
```

### Notification System

Send alerts via multiple channels:
- **Email**: Daily summary, approval requests, critical alerts
- **SMS**: Interruption notifications (limited to P1 events)
- **WhatsApp**: Group messages for regional teams
- **In-app**: Toast notifications, dashboard alerts

```typescript
// Future: Notifications
await notificationService.send('interruption:active', {
  channel: ['email', 'sms'],
  recipients: [stationAdmin, regionAdmin],
  payload: { equipmentId, tripTime, estimatedDuration }
});
```

### Advanced Reporting

Build a reporting engine that:
- **Predefined Reports**: Daily readings, monthly SLA, quarterly reliability
- **Custom Reports**: Users drag-and-drop metrics, date ranges, filters
- **Scheduling**: Auto-generate + email weekly/monthly
- **Drill-Down**: Click "Station A SLA" â†’ see all 24 hours + trend chart

---

## Code Organization

```
frontend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ App.tsx
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ Sidebar.tsx
â”‚   â”‚   â”œâ”€â”€ ReadingForm.tsx
â”‚   â”‚   â”œâ”€â”€ SLAForm.tsx
â”‚   â”‚   â”œâ”€â”€ InterruptionLog.tsx
â”‚   â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”‚   â””â”€â”€ ReportBuilder.tsx
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ ReadingsPage.tsx
â”‚   â”‚   â”œâ”€â”€ SLAPage.tsx
â”‚   â”‚   â”œâ”€â”€ DashboardPage.tsx
â”‚   â”‚   â”œâ”€â”€ ReportsPage.tsx
â”‚   â”‚   â”œâ”€â”€ AdminPage.tsx
â”‚   â”‚   â””â”€â”€ LoginPage.tsx
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”‚   â”œâ”€â”€ useReadings.ts
â”‚   â”‚   â”œâ”€â”€ useSLA.ts
â”‚   â”‚   â”œâ”€â”€ useOfflineSync.ts
â”‚   â”‚   â””â”€â”€ useRBAC.ts
â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ api.ts
â”‚   â”‚   â”œâ”€â”€ storage.ts
â”‚   â”‚   â””â”€â”€ auth.ts
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â””â”€â”€ styles/
â”‚       â””â”€â”€ index.css

backend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ reading.service.ts
â”‚   â”‚   â”œâ”€â”€ sla.service.ts
â”‚   â”‚   â”œâ”€â”€ interruption.service.ts
â”‚   â”‚   â”œâ”€â”€ inspection.service.ts
â”‚   â”‚   â”œâ”€â”€ template.service.ts
â”‚   â”‚   â”œâ”€â”€ formula.service.ts
â”‚   â”‚   â””â”€â”€ report.service.ts
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”œâ”€â”€ readings.routes.ts
â”‚   â”‚   â”œâ”€â”€ sla.routes.ts
â”‚   â”‚   â”œâ”€â”€ interruptions.routes.ts
â”‚   â”‚   â”œâ”€â”€ reports.routes.ts
â”‚   â”‚   â”œâ”€â”€ admin.routes.ts
â”‚   â”‚   â””â”€â”€ auth.routes.ts
â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”œâ”€â”€ auth.ts
â”‚   â”‚   â”œâ”€â”€ rbac.ts
â”‚   â”‚   â”œâ”€â”€ audit.ts
â”‚   â”‚   â””â”€â”€ errorHandler.ts
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ formula-engine.ts
â”‚       â”œâ”€â”€ validators.ts
â”‚       â””â”€â”€ excel-export.ts
â”œâ”€â”€ prisma/
â”‚   â”œâ”€â”€ schema.prisma
â”‚   â””â”€â”€ migrations/
â””â”€â”€ tests/
    â”œâ”€â”€ auth.test.ts
    â”œâ”€â”€ readings.test.ts
    â””â”€â”€ formula.test.ts
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install
npm install --prefix backend

# Start database (Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:14

# Setup database
cd backend && npx prisma db push

# Start both services
npm run dev              # Frontend: http://localhost:3000
npm run dev --prefix backend  # Backend: http://localhost:3001
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/interruption-tracking

# Make changes, test locally
npm run test
npm run lint

# Commit with semantic message
git commit -m "feat: add interruption tracking module"

# Push & create PR
git push origin feature/interruption-tracking

# Code review, CI/CD runs tests + linting
# Merge to main when approved
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## FAQ & Troubleshooting

### Q: Operator enters reading, but it doesn't appear in dashboard?
**A**: Check:
1. Is backend running? `curl http://localhost:3001/health`
2. Is reading sealed? Only unsealed readings editable
3. Is it today's date? Dashboard filters by current date by default
4. Check browser console for API errors

### Q: Formula returns NaN?
**A**: 
1. Verify all referenced fields are populated
2. Check formula syntax: `=(field1 * field2) / 1000` (not `=field1*field2/1000`)
3. Look at field values: if field contains "OFF" (code) not number, division fails

### Q: Offline sync failed?
**A**:
1. Check sync queue: `localStorage.getItem('syncQueue')`
2. Manually retry: `navigator.onLine` should be true
3. Check backend logs for validation errors
4. Clear queue if data is stale: `localStorage.removeItem('syncQueue')`

### Q: User can't see other stations?
**A**: Check role:
- **Operator**: Can only see own station
- **StationAdmin**: Can only see own station
- **RegionalAdmin**: Can see all stations in their region
- **HQAdmin**: Can see all stations

### Q: Database migration failed?
**A**:
```bash
# Inspect migration status
npx prisma migrate status

# Resolve conflicts manually
npx prisma db push --force-reset  # âš  DANGEROUS (loses data)

# Better: investigate error, fix schema, retry
npx prisma migrate dev --name fix_schema
```

---

## Maintenance & Updates

### Weekly Tasks

- [ ] Review error logs in CloudWatch
- [ ] Check database disk space
- [ ] Verify backups completed
- [ ] Scan for security vulnerabilities (`npm audit`)

### Monthly Tasks

- [ ] Analyze slow queries (top 10 in AWS RDS Performance Insights)
- [ ] Review audit logs for suspicious activity
- [ ] Test disaster recovery (restore from backup)
- [ ] Update dependencies (`npm update`)

### Quarterly Tasks

- [ ] Security audit (penetration testing)
- [ ] Capacity planning (storage, compute, bandwidth)
- [ ] Performance optimization (cache strategy, query tuning)
- [ ] Team training on new features

---

## Support & Escalation

**Tier 1 (L1)**: Frontend issues (UI bugs, form validation)
- Response time: 1 hour
- Escalate if: Backend involved or database issue

**Tier 2 (L2)**: Backend & API issues
- Response time: 30 minutes
- Escalate if: Database corruption or security issue

**Tier 3 (L3)**: Database & Infrastructure
- Response time: 15 minutes
- On-call engineer (24/7 for production)

---

## What's Next?

Phase 2 features (after Phase 1 MVP is stable):
1. SCADA real-time integration
2. Mobile app (iOS/Android)
3. Advanced reporting dashboard
4. Notification system (email/SMS/WhatsApp)
5. Template builder UI (drag-and-drop)
6. Multi-language support (English, Yoruba)
7. Offline-first PWA (works fully offline)
8. Regional/station-level analytics

---

**Questions?** Reach out to the NISO Engineering Team.
