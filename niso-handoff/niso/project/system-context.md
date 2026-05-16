# NISO System Context

**Project:** Nigeria Independent System Operation (NISO)
**Operator:** TCN (Transmission Company of Nigeria)
**Date Created:** May 8, 2026

## Purpose

NISO is a production-grade operational platform that centralizes TCN station data entry and reporting. It replaces fragmented Excel workflows with a single source of truth.

**Problem Solved:**
- TCN stations currently use overlapping Excel sheets (hourly readings, SLA, feeder data, interruptions, inspections)
- This causes duplicate entry, inconsistent data, manual calculations, poor visibility, difficult auditing
- NISO enforces: **ENTER ONCE → REUSE EVERYWHERE**

## Core Architecture

### Tech Stack
- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, PostgreSQL, Prisma ORM
- **State:** TanStack Query, React Hook Form, Zod validation
- **Pattern:** Modular monolith with service/repository layers

### Design Principles
- **Flat institutional UI** — no gradients, utility-grade operational styling
- **Desktop-first, responsive**
- **Keyboard-friendly workflows** (operators in shift, fast input)
- **Operational clarity over decoration**
- **Audit-safe** — every action logged, sealed records immutable
- **Role-aware** — strict backend-enforced isolation (region, station, equipment scope)

## Data Access Rules

**STRICT ISOLATION REQUIRED**

| Role | Scope |
|------|-------|
| Headquarters Admin | All regions, all stations |
| ICT Admin | System-wide config; no operational data access |
| Regional Admin | Assigned region only; sees all stations in region |
| Station Admin | Assigned station only |
| Supervisor | Assigned station; review/approval functions |
| Operator | Assigned station; input functions only |
| Viewer | Read-only; shared data only |
| Knowledge Admin | Document management only |

Backend enforces:
- Region scope (query filters at API layer)
- Station scope (query filters at API layer)
- Equipment scope (role-permission matrix in permissions table)
- Parameter scope (which fields can be edited by which role)

## Role-Based Sidebar Navigation

Sidebar is **dynamically generated from backend permissions**. Never show unauthorized modules.

### 1. Headquarters Admin
- Dashboard
- Operations (Live Grid, Regional Overview, Active Interruptions, Event Logbook, SLA Monitoring)
- Reports (National, Regional, SLA, Interruption, Inspection, Monthly)
- Regions & Stations (Regions, Stations, Device Registry)
- Templates & Formulas (Input Templates, Formula Engine, Report Builder, SLA Configs)
- Users & Access (Users, Roles, Permissions, Sharing Policies)
- Notifications (Center, Broadcasts)
- Knowledge & AI (Center, Assistant, AI Config)
- System (Audit Logs, Integrations, SCADA Mapping, Backup & Recovery)

### 2. ICT Admin
- Dashboard
- Operations (Active Interruptions, Event Logbook, SLA Monitoring)
- Reports (Regional, SLA, Monthly)
- System Management (Regions, Stations, Devices, Parameters, Templates, Formula Engine, Report Builder)
- Users & Access (Users, Roles, Permissions)
- Notifications (Notification Rules)
- Knowledge & AI (Center, AI Config)
- System (Audit Logs, Integrations, System Settings)

### 3. Regional Admin
- Dashboard (Regional Overview, Active Interruptions, SLA Overview)
- Operations (Hourly Readings, SLA Inputs, Inspections, Interruptions, Event Logbook, Planned Operations)
- Reports (Regional, Station, SLA, Interruption, Inspection, Monthly, Shared)
- Region Management (Stations, Devices, Templates, Formula Engine, Forecasts)
- Users & Access (Regional Users)
- Notifications (Broadcast Messages)
- Knowledge & AI (Center, Assistant)
- System (Audit Logs)

### 4. Station Admin
- Dashboard (Station Overview, Active Interruptions)
- Operations (Hourly Readings, SLA Inputs, Inspections, Interruptions, Event Logbook)
- Reports (Station, SLA, Interruption, Monthly, Shared)
- Station Management (Operators, Devices, Templates)
- Notifications (Messages)
- Knowledge & AI (Center, Assistant)
- System (Audit Logs)

### 5. Supervisor
- Dashboard (Operational Overview, Active Interruptions)
- Operations (Hourly Readings, SLA Inputs, Inspections, Interruptions, Event Logbook)
- Review & Approval (Corrections Queue, Pending Reviews)
- Reports (Station, SLA, Interruption)
- Notifications (Broadcasts)
- Knowledge & AI (Center, Assistant)

### 6. Operator
- Dashboard (Current Shift, Active Interruptions)
- Operations (Hourly Readings, SLA Inputs, Inspections, Interruptions, Event Logbook)
- Messages (Inbox, Station Messages)
- Knowledge & AI (Center, Ask NISO Assistant)
- Reports (My Reports, Exports)

### 7. Viewer
- Dashboard (Shared Dashboard)
- Reports (Shared, SLA, Monthly)
- Shared Views (Data Access)
- Knowledge (Center)

### 8. Knowledge Admin
- Dashboard (Knowledge Analytics)
- Knowledge Management (Articles, Procedures, PDFs, Categories, Tags, Versions)
- AI Knowledge (AI Sources, AI Indexing)
- Reports (Knowledge Usage)

## Core Operational Modules

### 1. Hourly Readings
- **Frequency:** 0000hrs → 2400hrs (24 readings/day per equipment)
- **Input:** Via side-drawer UX (equipment queue workflow)
- **Fields:** Depend on template (AMP, MW, MX, KV, etc.)
- **Storage:** `readings` table with raw_input, numeric_value, code_reference, value_type
- **Seal:** Month transitions lock previous readings

### 2. SLA (Service Level Agreement)
- **Fields owned by Operator:** Meter energy readings, MW, remarks
- **Fields owned by Regional Admin/NCC:** Forecast, formulas, SLA calculations
- **System-derived:** Calculated differences
- **Example:** Forecast (100MW) vs Actual (118MW) = Difference (-18MW)

### 3. Interruptions
- **Scope:** Single equipment, multi-equipment, multi-day
- **Fields:** Relay fault, trip time, restoration time, notes, status
- **Auto-calc:** Total Time Out = RestorationTime - TripTime
- **Status:** Active (shows live duration), Restored, Cleared

### 4. Inspections
- **Template-driven:** Each inspection is a session
- **Same UX:** Side-drawer workflow like readings
- **Auditable:** Every session logged with timestamp, approver

### 5. Reporting Engine
- **One source of truth, multiple outputs**
- **Report types:** Regional, Feeder, Area Load, SLA, Interruption, Inspection, Monthly
- **Sharing:** Authorized users can share (analyze, filter, export; cannot edit source)

### 6. Knowledge Center
- **Document management:** PDFs, procedures, relay guides, manuals, safety docs
- **RAG-based AI:** Grounds AI assistant on approved documents only (no hallucination)

## Template-Driven Input System

### No Generic Forms
- Support specific templates: 330kV, 132kV, transformer, reactor, feeder, SLA, inspection
- Admin/ICT can add fields, rearrange, add formulas
- Core operational fields remain protected

### Hybrid Input Model
- Numbers (330, 118)
- Operational codes (O/S, CB FLT, MNT)
- Text
- Store: raw_input, numeric_value (if applicable), code_reference (if matched), value_type

### Formula Engine
- Excel-like: arithmetic, IF, SUM, AVG, MAX, MIN, nested, cross-template references
- Example: `=(Voltage * Current)/1000`
- Example: `=SUM(ALL_33KV_FEEDERS)`
- Changes are versioned, activate immediately
- Historical values preserved (can re-analyze with old formulas)
- Invalid formulas allowed (marked as error, don't break system)

## Month Lifecycle

States:
- **Open:** Input continues, readings editable
- **Review:** Data reviewed, marked for approval
- **Sealed:** Raw records locked, formulas still allowed for historical analysis, audit trail complete

## Critical Input UX

### Reading Drawer Spec
```
[Equipment ID: 2JEB-KNJ1]

AMP     [input field]
MW      [input field]
MX      [input field]
KV      [input field]

───────────────────────────
Previous Hour Reading (faded)
AMP: 220
MW: 118
MX: 121
KV: 330
───────────────────────────

[Back]  [Save & Next]
```

### Workflow
1. Select Date
2. Select Hour
3. View Equipment Queue
4. Open Equipment Drawer
5. Input Data
6. Save & Next (auto-opens next equipment)

### UX Principles
- One equipment at a time
- Right-side slide-over drawer
- Previous values readonly
- Autosave while typing
- Inline validation
- Progress tracking
- Keyboard-friendly (Tab to fields, Enter to save)

## Data Model Concepts

### Tables (TBD PostgreSQL)
- `users` — authentication, roles
- `regions` — regional hierarchy
- `stations` — station metadata
- `equipment` — feeders, transformers, reactors
- `parameters` — voltage, current, power definitions
- `readings` — hourly operational readings
- `sla_entries` — forecast, meter readings, calculations
- `interruptions` — fault events, multi-day tracking
- `inspections` — inspection sessions, audit trail
- `templates` — input template definitions
- `formulas` — formula versions, audit trail
- `reports` — generated report snapshots
- `audit_logs` — user activity, edits, exports, approvals
- `notifications` — queued messages (email, SMS, WhatsApp, in-app)
- `sharing` — data sharing grants with scope (station, parameters, date range)

### Key Constraints
- Region isolation at query layer (WHERE region_id = ?)
- Station isolation (WHERE station_id = ?)
- Role-permission enforcement (backend only, never frontend)
- Sealed month immutability (raw_readings.sealed_at prevents UPDATE)
- Formula versioning (formula_id, version_number, activated_at)

## Audit Logging

Track:
- User edits (what field, old value, new value, timestamp)
- Formula changes (old formula, new formula, version, activation)
- Interruptions (trip time, restoration, status changes)
- Exports (what was exported, by whom, when)
- Sharing (grants issued, revoked, scope)
- Approvals (corrections approved, inspector sign-off)
- Login/logout (user activity for compliance)

## Offline Support

- Local queue for reads/SLA/interruptions
- IndexedDB persistence
- Auto-sync on reconnect
- Conflict logging (if data was edited remotely while offline)

## SCADA Readiness

- Support SCADA tags (equipment.scada_tag)
- Manual vs SCADA source tracking (reading.source: 'manual' | 'scada')
- Future ingestion services (API to receive SCADA telemetry)

## Next Phase Features (Not in MVP)

1. **Advanced Reporting:** Dashboard builder, drill-down views, trend analysis
2. **Forecasting:** Statistical models, load forecasting
3. **Predictive Maintenance:** Anomaly detection, fault prediction
4. **Mobile App:** iOS/Android for field operations
5. **SCADA Integration:** Real-time ingestion from SCADA systems
6. **Advanced Sharing:** Collaborative workspaces, commenting

## Build Log

### Phase 1: Foundation (Current)
- [x] Design tokens (colors, typography, spacing)
- [x] Role definitions and permission matrix
- [x] Sidebar navigation structure
- [ ] Modular component library
- [ ] Mock data layer
- [ ] Interactive prototype (Operator + Station Admin)
- [ ] Core modules (Readings, SLA, Interruptions, Inspections)
- [ ] Reading drawer UX
- [ ] Basic reporting

### Phase 2: Advanced Features
- [ ] Template builder UI
- [ ] Formula engine with versioning
- [ ] Month sealing workflow
- [ ] Full audit logging
- [ ] Knowledge center with RAG AI
- [ ] Notification system (email, SMS, WhatsApp)
- [ ] Sharing and collaborative features

### Phase 3: Production Ready
- [ ] Backend API (Next.js)
- [ ] PostgreSQL schema
- [ ] Authentication (OAuth2 or SAML)
- [ ] Rate limiting, security headers
- [ ] Offline sync
- [ ] SCADA integration framework

## Known Decisions

1. **No gradients** — Flat institutional UI only
2. **Desktop-first** — Operator in shift environment, keyboard workflow
3. **Backend-enforced isolation** — Never trust frontend permissions alone
4. **One data source, many views** — Single readings table generates all reports
5. **Formula versioning** — Historical analysis always possible
6. **Sealed months immutable** — Audit compliance; formulas still allowed
7. **Side-drawer input workflow** — Fast, keyboard-friendly, reduces cognitive load
8. **Role-based sidebar** — Never show unauthorized modules; dynamically generated

## Maintenance Notes

- All operational logic must be testable and maintainable
- Formulas and templates should NOT be hardcoded
- Permission checks at API layer (backend enforces, frontend just requests)
- Comments in code for operators and future developers
- Keep service/repository layers clean (business logic separate from data access)

---

**Last Updated:** May 8, 2026
**Status:** MVP Phase 1 — Foundation & Interactive Prototype
