# NISO System Context

## Overview
NISO (Nigeria Independent System Operation) is an enterprise operational data, reporting, and interruption management platform for TCN (Transmission Company of Nigeria) regions and stations.

The system **replaces overlapping Excel operational sheets** currently used across TCN/NISO regions with a centralized, auditable, template-driven operational utility.

## Not A...
- Generic CRUD app
- Startup analytics dashboard
- Spreadsheet replica
- Institutional CMS
- Generic monitoring tool

## What It Is
- Enterprise operational utility system
- Multi-region data isolation platform
- Template-driven input system
- Real formula engine (Excel-like)
- Audit-first operational record
- SCADA-ready architecture

## Core Design Principles
- **Flat institutional UI** — No gradients, utility-grade styling
- **Fast operator workflow** — Table + drawer-driven UX
- **Desktop-first responsive** — Serious operational look
- **Backend-enforced permissions** — Strict data scope isolation
- **Audit integrity** — All changes tracked and versioned

## Core Operational Model

The system supports 10 core workflows:

1. **Hourly Operational Readings** (0000-2400hrs) — equipment meter data
2. **SLA/Interface Accounting** — forecast vs actual MW/energy
3. **Inspection Workflows** — template-driven equipment inspections
4. **Interruption Management** — real-time outage tracking and restoration
5. **Planned Operations/Outages** — scheduled maintenance & downtime
6. **Event/Incident Logbook** — historical event tracking
7. **Internal Messaging** — station-to-station, user-to-user comms
8. **Knowledge & AI Guidance** — RAG-based operational assistant
9. **Reporting Engine** — multi-format report generation
10. **Shared External Views** — secure analytical data sharing

## Data Isolation Hierarchy

**STRICT ISOLATION REQUIRED**

- **Headquarters Admin** → Can access all regions
- **Regional Admin** → Only assigned region + stations
- **Station Admin** → Only assigned station
- **Operators/Supervisors** → Only assigned station
- **Viewers** → Read-only, scoped access

**Critical:** Stations under the same region MUST NOT see each other's records unless explicitly granted.

Backend enforces all scope checks before any data access.

## User Roles

- Headquarters Admin
- ICT Admin
- Regional Admin
- Station Admin
- Supervisor
- Operator
- Viewer
- Knowledge Admin

## Template-Based Input Engine

The system does NOT use generic forms.

Support **equipment/process-specific templates**:
- 330kV circuit template
- 132kV circuit template
- Transformer template
- Reactor template
- 33kV feeder template
- SLA template
- Inspection template
- Interruption template

**Admin/ICT can:**
- Add/remove fields
- Modify formulas
- Configure templates
- Rearrange layouts
- Create derived columns

**Core operational fields remain protected** from modification.

## Hybrid Input Model

Fields accept:
- **Numbers** — 330, 118, 1500
- **Operational codes** — O/S, CB FLT, MNT, REL
- **Text values** — freeform remarks

Store:
- Raw input value
- Numeric value (if applicable)
- Matched code (if applicable)
- Value type indicator

## Formula Engine

Real Excel-like formula evaluation.

Support:
- Arithmetic operators (+, -, *, /)
- IF/THEN logic
- Nested formulas
- SUM, AVG, MAX, MIN aggregations
- Cross-sheet references
- Cross-template references
- Multi-row aggregations

Examples:
```
=(Voltage * Current)/1000
=SUM(ALL_33KV_FEEDERS)
=IF(MW > 500, "ALERT", "OK")
```

**Formula Versioning:**
- Changes go live immediately
- Old records preserve historical values
- Formulas versioned in schema
- Changes audit-logged

## Month Lifecycle

States:
- **Open Month** — Active data entry
- **Review Month** — Supervisory review
- **Sealed Month** — Raw data locked, historical preservation

Sealed month behavior:
- Raw operational data cannot be edited
- Formulas for new analysis still allowed
- Historical values preserved
- Audit trail locked

## SLA / 33kV Feeder Module

NOT ordinary hourly reading.

Support:
- Forecast values (set by region/NCC)
- Meter energy readings (operator input)
- MW values
- Actual calculations
- Difference tracking (forecast vs actual)
- Feeder/accounting logic

**Field Ownership:**
- **Operator:** Meter reading, MW, remarks
- **Region Admin/NCC:** Forecast, SLA thresholds
- **System:** Auto-calculated actuals, differences, variance

## Operational UX Pattern

**Critical:** Do NOT use giant spreadsheet input tables.

**Side-Drawer Input Workflow:**

```
1. Select Hour (time picker)
2. Select Equipment (table search/filter)
3. Drawer Opens (right side)
4. Input Values (form fields)
5. Save & Next (advance to next equipment)
```

**Drawer Context:**
- Equipment metadata (code, type, voltage, station)
- Template-driven field display
- Previous hour reading (faded/subtle)
- Inline validation
- Progress indicator
- Keyboard shortcuts (Ctrl+Enter to save)

## Interruption Module

Real-time operational event system.

Support:
- Single equipment interruption
- Multi-equipment interruption
- Active interruption dashboard
- Restoration tracking
- Multi-day interruptions

**Per Equipment:**
- Relay fault code
- Trip time (auto or manual)
- Restoration time (operator entry)
- Freeform notes
- Status indicator (ACTIVE, RESTORED, PENDING)
- Total time out (auto-calculated, live if active)

Example display:
```
330kV Line A
ACTIVE • 1d 08:42
Relay: Distance Protection
Trip: 2024-05-08 10:30
Remarks: Lightning strike
```

## Reporting Engine

**One source of truth. Multiple report outputs.**

Generate:
- Regional reading sheets (Excel)
- Feeder performance reports
- Area load reports
- SLA monthly reports
- Interruption analysis reports
- Inspection summary reports
- Audit trail reports

Do NOT store reports internally. Generate dynamically from operational data.

## Data Sharing

Secure analytical data sharing.

Users with permission:
- Headquarters Admin
- ICT Admin
- Region Admin
- Station Admin
- Supervisor

Can share:
- Station readings
- Equipment subset
- Parameter selection
- Date range selection

Recipients:
- View-only access
- Can filter/analyze
- Can export to Excel/PDF
- Cannot edit operational records
- Watermark: "NISO System – Confidential"

Support:
- Email-based sharing
- Multiple recipients
- Group sharing
- Time-limited access

## Knowledge Module

Internal operational knowledge center.

Store:
- PDFs
- Procedures
- Relay guides
- Operational manuals
- Safety documents
- Approved incident case studies

Features:
- Full-text search
- Categories & tags
- Version history
- Download tracking
- Audit access logs

## AI Knowledge Assistant

RAG-based assistant grounded ONLY on approved uploaded documents.

Purpose: Help operators understand procedures and faults.

Example interaction:
```
User: "What should I check after distance relay trip?"
Assistant: Based on NISO Relay Guide v2.1 §3.4...
[cites source document]
[provides checklist]
[suggests escalation if unsure]
```

Constraints:
- Cite document sources
- Avoid hallucination
- Say when no approved guidance exists
- Suggest escalation for safety-critical unknowns

## Audit Logging

Track all operational changes:
- Reading entries & edits
- Formula changes
- Interruption creation & restoration
- Data shares
- Downloads
- User login/logout
- Permission changes
- Configuration modifications
- Month state transitions

Audit record structure:
```
{
  timestamp
  userId
  action (CREATE, UPDATE, DELETE, RESTORE, SHARE, etc.)
  entityType (Reading, Interruption, etc.)
  entityId
  oldValues
  newValues
  scope (region, station, equipment)
  ipAddress
  userAgent
}
```

## Offline Support

System must tolerate poor network conditions.

Support:
- Local queue for unsent changes
- Auto-sync when reconnected
- Conflict logging & resolution
- Offline indicator in UI

## SCADA-Ready Architecture

Prepare for future SCADA integration without rebuilding.

Support:
- SCADA tag mapping (future)
- Manual vs SCADA source indicator
- Ingestion endpoints (placeholders)
- Dual-source priority configuration

## Backend Architecture

- **Service Layer** — Business logic separation
- **Repository Layer** — Data access abstraction
- **Permission Service** — Scope enforcement
- **Formula Engine** — Evaluation & versioning
- **Audit Service** — Change tracking
- **Notification Service** — Multi-channel alerts

All database operations enforce:
- User scope (region/station)
- Role-based permissions
- Audit logging
- Timestamp tracking

## Tech Stack

- **Frontend:** Next.js 13+ (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (no gradients, flat institutional look)
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query
- **Components:** shadcn/ui (institutional theme)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **API:** REST (eventual GraphQL)

## Modular Architecture

Each module is independent:
- Dashboard
- Readings (hourly input)
- SLA/Feeders
- Interruptions
- Inspections
- Reports
- Knowledge Base
- Messaging
- Admin
- Audit

Can be deployed separately or together.

## Internal Documentation

Maintain docs in `/docs/internal/`:
- SYSTEM_CONTEXT.md (this file)
- MODULES_OVERVIEW.md
- BUILD_LOG.md
- DATA_MODEL_NOTES.md
- WORKFLOWS.md
- KNOWN_DECISIONS.md
- NEXT_STEPS.md

Purpose: Enable future developers/AI systems to understand architecture, workflows, decisions, and pending work.
