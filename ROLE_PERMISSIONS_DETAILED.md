# NISO: Detailed Role Permissions & Access Control Rules

**This document defines EXACTLY what each role can/cannot do.**

**All permissions must be enforced on the backend via middleware.**

---

## Core Principles

1. **Backend-First Enforcement**: Frontend shows/hides UI, but backend blocks unauthorized requests
2. **Scope Restriction**: Users can only access assigned region/station
3. **Immutable Audit Trail**: All actions logged, cannot be removed
4. **Sealed Records Protection**: Cannot edit sealed/historical data
5. **Zero Bypass**: No direct route access, API key, or workaround bypasses RBAC

---

## Role Hierarchy

```
HQ Admin (national scope)
├── ICT Admin (technical/platform)
├── Regional Admin (region scope)
│   ├── Station Admin (station scope)
│   │   ├── Supervisor (operational review)
│   │   ├── Operator (data entry)
│   │   ├── Viewer (read-only)
│   │   └── Knowledge Admin (documentation)
```

---

## 1. HEADQUARTERS ADMIN

**Scope**: National (all regions, all stations)  
**Purpose**: National-level oversight and governance

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| View all operational data | Nationwide | All readings, SLA, interruptions, inspections |
| View all reports | Nationwide | Any generated report, any station |
| View all audit logs | Nationwide | All user actions, all resources |
| Create/manage regions | System-wide | Define regional boundaries |
| Create/manage regional admins | System-wide | Assign regional admins to regions |
| Configure national templates | System-wide | Define reading/inspection templates |
| Configure national formulas | System-wide | Define calculation formulas (all versions) |
| Configure SLA standards | System-wide | Min/max forecast differences, alert thresholds |
| Configure operational codes | System-wide | Cause codes, status codes, equipment types |
| Configure system settings | System-wide | Notifications, integrations, SCADA mappings |
| Export all reports | Nationwide | Excel, PDF, CSV of any data |
| Manage sharing policies | System-wide | Who can share what, with whom, for how long |
| Manage integrations | System-wide | SCADA, third-party platforms, APIs |
| Manage AI configuration | System-wide | AI knowledge assistant settings, indexing |
| Manage backup/recovery | System-wide | Database backups, disaster recovery |
| Revoke any shared access | Nationwide | Remove time-limited shares across network |
| View active interruptions | Nationwide | Real-time list of all ongoing trips |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Edit sealed/historical records | Audit trail protection |
| Remove audit history | Compliance requirement |
| Bypass system logging | All actions must be trackable |
| Disable operational traceability | Regulatory mandate |

### Scope Rules

- Can view **any region**
- Can view **any station**
- Can query **all records** with filters
- **No hidden data** (can see everything)

---

## 2. ICT ADMIN

**Scope**: System-wide (but may be region-scoped in future)  
**Purpose**: Technical/platform administration and configuration

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| Create/manage users | Assigned scope | Create, update, deactivate users |
| Assign roles & permissions | Assigned scope | Grant roles to users within scope |
| Configure stations | Assigned scope | Add equipment, define parameters |
| Configure devices/equipment | Assigned scope | Register new transformers, circuits, generators |
| Configure templates | Assigned scope | Create/edit reading and inspection templates |
| Configure formulas | Assigned scope | Create/edit formulas (immediate activation) |
| Configure report builder | Assigned scope | Design custom report structures |
| Configure integrations | Assigned scope | SCADA, third-party connectors |
| Configure notifications | Assigned scope | Email, SMS, WhatsApp routing |
| Configure AI knowledge | Assigned scope | Knowledge indexing, assistant behavior |
| Configure operational codes | Assigned scope | Custom codes for region/station |
| Configure SLA structures | Assigned scope | Forecast formats, calculation rules |
| Configure SCADA mappings | Assigned scope | Equipment ↔ SCADA tag mappings |
| View audit logs | Assigned scope | All actions within scope |
| Troubleshoot operational issues | Assigned scope | Debug data, queries, calculations |
| Export reports | Assigned scope | Download operational data |
| Modify formulas immediately | Assigned scope | Edit formulas, create versions |
| Manage documentation | Assigned scope | Update internal technical docs |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Edit sealed/raw operational records | Data integrity |
| Access unauthorized regions | Scope restriction |
| Remove audit history | Compliance |
| Modify historical calculated results directly | Audit trail |

### Scope Rules

- If **system-wide scoped**: Can modify global settings
- If **region-scoped**: Can only modify assigned region
- Can view **audit logs** within scope
- **Cannot bypass** regional boundaries

---

## 3. REGIONAL ADMIN

**Scope**: Assigned region only  
**Purpose**: Operational authority over region

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| View all stations in region | Region | All stations in assigned region |
| Manage regional users | Region | Create station admins, supervisors, operators |
| Manage station admins | Region | Assign, update, deactivate station admins |
| Configure regional templates | Region | Override national templates for region |
| Configure regional formulas | Region | Override national formulas for region |
| Configure regional SLA forecasts | Region | Define SLA standards for region |
| Create/manage interruptions | Region | Log, update, resolve interruptions |
| View regional interruptions | Region | All interruptions in region |
| View regional inspections | Region | All inspections in region |
| View regional reports | Region | Any report generated for region |
| Share regional data | Region | Grant time-limited access to region data |
| Export regional reports | Region | Excel/PDF export of regional data |
| Approve corrections | Region | Approve corrected readings in region |
| Review operational entries | Region | Validate readings, SLA, interruptions |
| Manage regional notifications | Region | Configure regional alert policies |
| Broadcast regional messages | Region | Send operational messages to region |
| Upload operational documents | Region | Add PDFs, procedures to knowledge center |
| Use AI assistant | Region | Access AI for regional data analysis |
| Manage operational workflows | Region | Define region-specific workflows |
| View regional audit logs | Region | All audit entries for region |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Access another region | Scope restriction |
| View another region's records | Authorization |
| Modify global system settings | Authority limit |
| Modify national templates | Authority limit |
| Edit sealed records | Data integrity |
| Remove audit history | Compliance |

### Scope Rules

- Can view **only assigned region**
- Can view **all stations** in region
- Can query **all records** in region with filters
- **Blocked from** viewing sibling regions
- **Cannot access** national-only settings

---

## 4. STATION ADMIN

**Scope**: Assigned station only  
**Purpose**: Operational authority for station

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| View all operational records | Station | All readings, SLA, interruptions, inspections |
| Manage station users | Station | Create operators, supervisors, viewers |
| Manage station interruptions | Station | Log, update, resolve, reopen |
| Manage station inspections | Station | Create, review, approve inspections |
| Review station readings | Station | Validate hourly readings |
| Share station data | Station | Grant time-limited access (reports, readings) |
| Export station reports | Station | Excel/PDF export |
| View station audit logs | Station | All actions within station |
| Manage station workflow | Station | Define local operational processes |
| Upload operational documents | Station | Add PDFs, procedures (if Knowledge Admin permits) |
| Configure approved formulas | Station | Use pre-approved formulas for station |
| Configure approved templates | Station | Use pre-approved templates for station |
| Manage local notifications | Station | Configure station-level alerts |
| Broadcast station messages | Station | Send operational messages to station users |
| Use AI assistant | Station | Analyze station data |
| Review active interruptions | Station | List current/ongoing interruptions |
| Reopen interruption sessions | Station | If policy allows (audit logged) |

### CANNOT DO

| Action | Reason |
|--------|--------|
| View another station | Scope restriction |
| View sibling station in region | Authorization |
| Access another region | Scope restriction |
| Modify global formulas | Authority limit |
| Modify global templates | Authority limit |
| Edit sealed records | Data integrity |
| Remove audit history | Compliance |
| Create global formulas | Authority limit |

### Scope Rules

- Can view **only assigned station**
- Can view **all records** in station
- **Blocked from** viewing other stations
- **Blocked from** accessing other regions
- **Cannot modify** national/regional settings

---

## 5. SUPERVISOR

**Scope**: Assigned station  
**Purpose**: Operational review and approval role

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| Review hourly readings | Station | View all readings, validate, approve corrections |
| Approve corrections | Station | Approve corrected reading entries |
| Review SLA inputs | Station | Check forecast vs actual entries |
| Review inspections | Station | Review inspection findings, approve |
| Open interruptions | Station | Log new equipment trips |
| Update interruptions | Station | Add notes, status changes, restoration data |
| Close interruptions | Station | Mark as resolved/cleared |
| Enter restoration data | Station | Record restoration time, duration |
| View active interruptions | Station | Real-time list of ongoing trips |
| Review operational logs | Station | View readings, SLA, interruption history |
| Export reports | Station | Download operational data |
| Share reports | Station | Share with external parties (time-limited) |
| Broadcast messages | Station | Send operational messages to staff |
| Use AI assistant | Station | Analyze station operational data |
| Access dashboards | Station | View operational metrics, charts |
| View previous records | Station | Access historical readings, SLA, interruptions |
| Reopen sessions | Station | Re-open interruption if policy allows |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Manage users | Not an admin role |
| Configure formulas | Authority limit |
| Configure templates | Authority limit |
| Access unauthorized stations | Scope restriction |
| Access unauthorized regions | Scope restriction |
| Edit sealed records | Data integrity |
| Remove audit logs | Compliance |

### Scope Rules

- Can view **assigned station only**
- Can see **all records** in station
- **Cannot manage** users or settings
- **Cannot modify** formulas or templates

---

## 6. OPERATOR

**Scope**: Assigned station  
**Purpose**: Primary operational data entry role

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| Input hourly readings | Station | Enter meter values for assigned equipment |
| Input hybrid values | Station | Numbers, operational codes, text as template allows |
| Input SLA meter readings | Station | Enter hourly generator MW output |
| Input feeder MW values | Station | Enter feeder power values |
| Input inspection data | Station | Fill inspection checklists with findings |
| Open interruptions | Station | Log equipment trips (timestamp, cause code) |
| Add interruption notes | Station | Add context/notes to interruptions |
| Update interruption status | Station | Mark as investigating, under repair, etc. |
| Enter restoration time | Station | Record restoration time if permitted |
| View active interruptions | Station | See current/ongoing equipment trips |
| View previous readings | Station | Access readings from previous hours/days |
| Save drafts/autosave | Station | Unsaved work preserved in browser |
| View assigned reports | Station | Pre-assigned dashboard/report views |
| Export allowed reports | Station | Download reports they have access to |
| Use AI knowledge assistant | Station | Ask questions about operational procedures |
| Search knowledge center | Station | Find procedures, manuals, troubleshooting |
| Send operational messages | Station | Communicate with colleagues |
| Receive messages | Station | Get broadcast messages from station |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Access another station | Scope restriction |
| Access another region | Scope restriction |
| Modify formulas | Authority limit |
| Modify templates | Authority limit |
| Modify system settings | Authority limit |
| Manage users | Not an admin role |
| Edit sealed records | Data integrity |
| Delete interruption history | Audit trail |
| Remove audit logs | Compliance |
| Change report structures | Authority limit |

### Scope Rules

- Can view **assigned station only**
- Can **only enter data** (read/create)
- **Cannot modify** formulas, templates, settings
- **Cannot delete** any records
- **Cannot access** sibling stations

---

## 7. VIEWER

**Scope**: Assigned dashboard/report views  
**Purpose**: Read-only operational and analytical access

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| View assigned dashboards | Assigned | Pre-configured dashboard views |
| View assigned reports | Assigned | Reports shared with this user |
| Search/filter operational data | Assigned | Query shared datasets |
| Analyze shared records | Assigned | Analyze readings, SLA, interruptions |
| Export Excel reports | Assigned | Download shared data as Excel |
| Export PDF reports | Assigned | Download reports as PDF |
| Use shared data views | Assigned | Access time-limited data shares |
| View assigned interruptions | Assigned | Interruptions in shared datasets |
| View assigned SLA reports | Assigned | SLA data shared with them |
| Use knowledge center | Station | Search operational procedures |
| Use AI assistant | Assigned | Ask questions about shared data |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Edit operational records | Read-only role |
| Input readings | Read-only role |
| Modify formulas | Authority limit |
| Modify templates | Authority limit |
| Create interruptions | Authority limit |
| Close interruptions | Authority limit |
| Manage users | Authority limit |
| Configure reports | Authority limit |
| Access unauthorized data | Authorization |
| Access hidden parameters | Authorization |
| Modify operational workflow | Authority limit |

### Scope Rules

- Can view **only shared dashboards/reports**
- Can view **only shared data**
- **Cannot access** unsealed records unless shared
- **Cannot create** anything
- **Cannot modify** anything

---

## 8. KNOWLEDGE ADMIN

**Scope**: Knowledge center  
**Purpose**: Operational learning/documentation management

### CAN DO

| Action | Scope | Details |
|--------|-------|---------|
| Upload PDFs | Knowledge center | Add operational manuals, procedures |
| Upload procedures | Knowledge center | Add step-by-step guides |
| Create operational articles | Knowledge center | Write troubleshooting, best practices |
| Edit articles | Knowledge center | Update content, fix errors |
| Manage categories | Knowledge center | Organize by equipment type, procedure type |
| Manage tags | Knowledge center | Tag articles for searchability |
| Manage article versions | Knowledge center | Track document versions, dates |
| Configure AI sources | Knowledge center | Add documents to AI training |
| Configure indexing | Knowledge center | Make content searchable |
| Archive documents | Knowledge center | Hide outdated procedures |
| Pin important procedures | Knowledge center | Feature high-priority guides |
| View knowledge analytics | Knowledge center | Track document usage, search patterns |
| Manage operational references | Knowledge center | Curate searchable knowledge base |

### CANNOT DO

| Action | Reason |
|--------|--------|
| Modify operational readings | Not data entry role |
| Modify interruptions | Not operational role |
| Modify formulas (unless separate permission) | Authority limit |
| Access unauthorized operational data | Scope restriction |
| Edit sealed records | Data integrity |

### Scope Rules

- Can manage **knowledge center only**
- **Cannot access** operational data (readings, SLA, interruptions)
- **Cannot modify** formulas/templates (unless separately granted)
- Can manage **all knowledge documents** (if not region-scoped)

---

## General Access Rules (ALL USERS)

### Audit Logging

Every user action is logged:
- **What**: Action type (create, update, delete, seal, approve, export, share)
- **Who**: User ID, email, timestamp
- **Where**: IP address, user agent
- **How**: Before/after values (for mutations)
- **Why**: Context (reading ID, equipment, station, etc.)

### Scope Restriction

Users **cannot**:
- Access unauthorized regions
- Access unauthorized stations
- Access unauthorized parameters
- View hidden fields
- Bypass access controls via API

### Sealed Record Protection

When reading is sealed (`sealedAt IS NOT NULL`):
- **No edits** allowed (database constraint)
- **No deletes** allowed
- **Cannot unseal** (only flag for correction)
- **Historical value** preserved forever

When month is sealed:
- **All raw data** locked
- **No edits** to readings
- **No edits** to SLA entries
- **New formulas** can still run (calculate over locked data)
- **Corrections** must be documented separately

### Backend Enforcement

**CRITICAL**: All permissions enforced on backend:

```typescript
// Example middleware
async function checkReadingAccess(req, res, next) {
  const reading = await Reading.findById(req.params.readingId);
  const user = req.user;

  // User must own the station OR be regional/HQ admin
  if (user.stationId !== reading.stationId && user.role !== 'REGIONAL_ADMIN' && user.role !== 'HQ_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Cannot modify sealed readings
  if (reading.sealedAt && req.method !== 'GET') {
    return res.status(409).json({ error: 'Record is sealed' });
  }

  next();
}
```

---

## Sharing Rules

### What Can Be Shared

- **Reports**: Generated reports (daily, weekly, monthly)
- **Parameters**: Specific equipment readings
- **Equipment**: All readings for a piece of equipment
- **Datasets**: Date ranges of operational data

### Who Can Share

- **Station Admin+**: Can share station data
- **Regional Admin+**: Can share region data
- **HQ Admin**: Can share any data

### Share Recipients

Recipients with shared data:
- ✅ **CAN**: Analyze, export (Excel/PDF), view dashboards
- ❌ **CANNOT**: Edit operational records, modify formulas, remove sharing

### Share Duration

- **Time-limited**: Expires after configured period (7 days, 30 days, etc.)
- **Revocable**: Can be revoked at any time
- **Audit-logged**: All shares tracked

---

## Sealed Month Rules

### Trigger

Month sealed when regional admin approves final closure for month.

### Effects

**Readable**: ✅ All data still viewable  
**Editable**: ❌ No modifications to raw readings  
**Deletable**: ❌ Cannot delete records  
**Formulaic**: ✅ Formulas can still recalculate over sealed data  
**Correctable**: ✅ Corrections create new entries (audit trail)

### Example

```
October 2024 sealed.
- Operator tries to edit Oct 15 reading → BLOCKED (403)
- Supervisor tries to approve Oct 15 → BLOCKED (403)
- Formula "Apparent Power" runs over Oct → ✅ ALLOWED
- Operator creates correction entry (Oct 15v2) → ✅ ALLOWED (audit-logged)
```

---

## Formula Engine Rules

### Who Can Create/Modify

- **HQ Admin**: Create national formulas
- **ICT Admin**: Create/modify assigned scope
- **Regional Admin**: Create regional overrides
- **Station Admin**: Use approved formulas (cannot create)

### Activation

- **Immediate activation** or **scheduled** activation
- **Preserve historical** values (don't recalculate past)
- **Version control**: Each formula has version number + activation date
- **Rollback**: Previous versions always available

### Immutability

- **Formula versions** are immutable (cannot edit v1, create v2 instead)
- **Calculated values** preserved if formula is deleted
- **Audit trail** shows all formula changes

---

## Audit Rules

### What Is Logged

| Action | Logged | Details |
|--------|--------|---------|
| Create reading | ✅ | User, equipment, value, timestamp |
| Update reading | ✅ | User, old value, new value, reason |
| Delete reading | ✅ | User, deleted data, timestamp |
| Seal reading | ✅ | User, reason, timestamp |
| Approve reading | ✅ | User, reading ID, timestamp |
| Create formula | ✅ | User, formula expression, version |
| Modify formula | ✅ | User, old expression, new expression |
| Create interruption | ✅ | User, equipment, cause code, timestamp |
| Resolve interruption | ✅ | User, restoration time, duration |
| Approve SLA | ✅ | User, entry ID, timestamp |
| Export report | ✅ | User, report type, filters, timestamp |
| Share data | ✅ | User, recipient, scope, duration, timestamp |
| Create user | ✅ | User, new user email, role, timestamp |
| Deactivate user | ✅ | User, deactivated email, reason |
| Login | ✅ | User, IP address, timestamp, success/failure |
| Restore interruption | ✅ | User, interruption ID, reason |

### Audit Log Properties

- **Immutable**: Cannot be edited or deleted
- **Permanent**: 7-year minimum retention
- **Queryable**: By user, date range, action type, resource type
- **Exportable**: For compliance audits
- **Timestamped**: Precise to millisecond

---

## Exception Handling

### Denied Access Scenarios

```typescript
// Scenario 1: Operator tries to view another station
if (user.role === 'OPERATOR' && user.stationId !== requestedStationId) {
  return 403; // Forbidden
}

// Scenario 2: Supervisor tries to edit sealed reading
if (reading.sealedAt !== null && !isHQAdmin(user)) {
  return 409; // Conflict (cannot modify)
}

// Scenario 3: Regional Admin tries to access another region
if (user.role === 'REGIONAL_ADMIN' && user.regionId !== requestedRegionId) {
  return 403; // Forbidden
}

// Scenario 4: User tries to delete audit log
if (resource === 'audit_log' && method === 'DELETE') {
  return 403; // Forbidden (immutable)
}
```

---

## Implementation Checklist

### Backend Routes

- [ ] All endpoints check user scope (station/region/national)
- [ ] All POST/PUT/DELETE check role permissions
- [ ] Sealed records return 409 (Conflict) on edit attempts
- [ ] Audit logs created for every mutation
- [ ] Query results filtered by user scope

### Middleware Stack

```typescript
// Applied in order
app.use(authMiddleware);           // JWT validation
app.use(scopeMiddleware);          // Add user scope info
app.use(rbacMiddleware);           // Check permissions
app.use(auditMiddleware);          // Log all mutations
app.use(sealedRecordMiddleware);   // Block sealed record edits
```

### Testing

- [ ] Unit tests for each role's permissions
- [ ] Integration tests for scope restrictions
- [ ] Test that sealed records cannot be edited
- [ ] Test that audit logs are immutable
- [ ] Test that users cannot bypass RBAC via direct API calls

---

## Reference: Quick Permission Matrix

|  | HQ | ICT | Regional | Station | Supervisor | Operator | Viewer | Knowledge |
|---|---|---|---|---|---|---|---|---|
| View all regions | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all stations | ✅ | ⚠️ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create readings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve readings | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Seal readings | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit sealed records | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create formulas | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Modify formulas | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| Upload documents | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

**Legend**: ✅ = Full access | ⚠️ = Limited/scoped | ❌ = Blocked | * = Region only

---

**Last Updated**: 2024  
**Version**: 1.0
