# NISO Modules Overview

## 1. Dashboard

**Purpose:** At-a-glance operational status  
**Visible to:** All roles  
**Key Metrics:**
- Active Equipment (count)
- Interruptions (count + alert flag)
- SLA Status (On Track / Warning / Alert)
- Shift Time (elapsed hours)

**Future Enhancements:**
- Customizable widgets per role
- Live data refresh
- Real-time SCADA status
- Trend sparklines

---

## 2. Hourly Readings

**Purpose:** Capture operational readings every hour (0000–2400 hrs)  
**Visible to:** Operator, Supervisor, Station Admin, Regional Admin, Headquarters Admin  
**Workflow:**

1. Select Date (default: today)
2. Select Hour (0000–2400)
3. View Equipment Queue (filtered by station)
4. Open Equipment → Side-drawer
5. Input Data (numbers, codes, text)
6. Save & Next → Auto-open next equipment

**Input UX (Drawer):**
- Equipment ID at top
- Form fields (template-driven; default: AMP, MW, MVAR, KV)
- Previous hour values (readonly, faded)
- [Back] [Save & Next] footer buttons
- Keyboard-friendly (Tab, Enter)
- Autosave while typing (future)

**Data Storage:**
```
readings {
  id
  equipment_id
  date
  hour
  raw_input (string as entered)
  numeric_value (parsed number or null)
  code_reference (matched code or null)
  value_type ('number' | 'code' | 'text')
  created_by (user_id)
  created_at
  sealed_at (null until month sealed)
}
```

**Validation:**
- Hour must be 0–23 (exclusive) or 0–2400 (inclusive)
- Required fields depend on template
- Numeric fields must be valid numbers
- Code values must match predefined codes
- Duplicate entries prevented (same equipment + hour)

**Month Lifecycle:**
- **Open:** New readings can be added/edited
- **Review:** Marked for approval, edits allowed
- **Sealed:** No edits allowed, `sealed_at` timestamp set

---

## 3. SLA (Service Level Agreement)

**Purpose:** Track forecast vs. actual power delivery  
**Visible to:** Operator (input), Regional Admin (forecast + approval), Supervisor (review)  
**Fields:**

| Field | Owner | Type | Purpose |
|-------|-------|------|---------|
| Forecast (MW) | Regional Admin / NCC | Number | Expected load |
| Meter Energy Reading (MWh) | Operator | Number | Cumulative energy meter |
| Actual MW | Operator | Number | Measured generation |
| Difference | System | Auto-calc | Actual - Forecast |
| Remarks | Operator | Text | Notes on variance |

**Auto-Calculation:**
```
Difference = Actual MW - Forecast MW
```

**Status Logic:**
- If |Difference| ≤ 2: Status = "On Track" (green)
- If 2 < |Difference| ≤ 5: Status = "Review" (amber)
- If |Difference| > 5: Status = "Alert" (red)

**Workflow:**
1. Regional Admin provides forecast (0–2400 hrs)
2. Operator enters meter reading + actual MW
3. System auto-calculates difference
4. Supervisor reviews for SLA compliance
5. Data sealed with month

**Data Storage:**
```
sla_entries {
  id
  station_id
  date
  hour
  forecast_mw (from Regional Admin)
  meter_reading_kwh (from Operator)
  actual_mw (from Operator)
  difference_mw (auto-calc)
  remarks (from Operator)
  created_by (user_id)
  created_at
  approved_by (supervisor_id or null)
  approved_at (timestamp or null)
  sealed_at (null until month sealed)
}
```

---

## 4. Interruptions

**Purpose:** Track equipment faults and restoration  
**Visible to:** All operational roles  
**Scope:**
- Single equipment (most common)
- Multi-equipment (rare; one session records all affected)
- Multi-day (trip on day 1, restore on day 2+)

**Data Entry (Drawer):**
- Equipment (dropdown or multi-select)
- Cause (select: Relay Fault, CB Fault, Manual Trip, etc.)
- Trip Time (datetime-local picker)
- Restoration Time (optional; null if still active)
- Notes (textarea)

**Auto-Calculated Field:**
```
Total Time Out = Restoration Time - Trip Time (in seconds)
Display format: "1d 08:42" or "ACTIVE • 2h 15m"
```

**Status Tracking:**
- **Active:** `restoration_time` is null; shows live duration
- **Restored:** `restoration_time` filled; closed status

**Data Storage:**
```
interruptions {
  id
  equipment_id
  trip_time (datetime)
  restoration_time (datetime or null)
  cause_id (foreign key to interruption_causes)
  cause_code ('RELAY_FLT', 'CB_FLT', 'MNT', 'TRIP_MANUAL', etc.)
  notes (text)
  status ('Active' | 'Restored' | 'Cleared')
  duration_seconds (auto-calc from restoration_time - trip_time)
  created_by (user_id)
  created_at
  resolved_by (user_id or null)
  resolved_at (timestamp or null)
}

interruption_causes {
  id
  code (unique)
  name
  description
}
```

**Reporting:**
- Count active interruptions
- Total time out per equipment
- Frequency analysis (which equipment faults most)
- MTTR (Mean Time To Restore)

---

## 5. Inspections

**Purpose:** Record equipment inspection sessions  
**Visible to:** All roles  
**Template-Driven:**
- Each inspection is a session
- Admin can define custom inspection templates
- Templates contain checklist items, findings fields

**Data Entry (Drawer):**
- Equipment (dropdown)
- Inspection Type (Routine, Maintenance, Post-Fault, Annual)
- Inspector Name (text)
- Findings (textarea; can be structured or free-form)

**Data Storage:**
```
inspections {
  id
  equipment_id
  inspection_date (datetime)
  type_id (foreign key to inspection_types)
  inspector_id (user_id)
  findings (JSONB or text; depends on template)
  photos (array of URLs; future)
  created_at
  approved_by (supervisor_id or null)
  approved_at (timestamp or null)
}

inspection_types {
  id
  name ('Routine', 'Maintenance', 'Post-Fault', 'Annual')
  description
  template_fields (JSONB; defines form structure)
}
```

**Approval Workflow:**
- Inspector submits inspection
- Supervisor reviews findings
- Approved inspections locked (cannot edit)
- Historical record maintained for compliance

---

## 6. Reporting Engine

**Purpose:** Generate multiple views from single data source  
**Report Types:**

| Report | Based On | Output |
|--------|----------|--------|
| Daily Readings | `readings` table | Hourly values per equipment |
| SLA Report | `sla_entries` table | Forecast vs actual, variance %, compliance |
| Interruption Log | `interruptions` table | Fault count, MTTR, top failing equipment |
| Inspection Report | `inspections` table | Completed inspections, outstanding items |
| Monthly Summary | All tables | Full operational summary |
| Regional Report | Multi-station aggregate | Regional KPIs |

**Output Formats (Future):**
- Excel (.xlsx)
- PDF (.pdf)
- JSON (for dashboards)
- CSV (for integration)

**Data Model:**
```
reports {
  id
  name
  type ('daily_readings', 'sla', 'interruption', 'inspection', 'monthly', 'regional')
  generated_by (user_id)
  generated_at (timestamp)
  date_range (start_date, end_date)
  filters (JSONB; station_id, equipment_id, status, etc.)
  data (JSONB or stored as blob)
  expires_at (null = permanent; else auto-delete)
}
```

---

## 7. Knowledge Center

**Purpose:** Centralized operational document repository  
**Content Types:**
- PDFs (procedures, manuals, relay guides)
- Procedures (step-by-step operational guides)
- Safety Documents (OSHA, compliance)
- Reference Material (equipment specs)

**Features:**
- Search + filter by category/tag
- Version history (track updates)
- Upload + organize by Knowledge Admin
- RAG-based AI assistant (future; grounded on approved docs only)

**Data Storage:**
```
knowledge_articles {
  id
  title
  category_id (foreign key)
  content (text or URL if external)
  document_url (PDF file path)
  tags (array of strings)
  version (int; auto-increment on update)
  created_by (user_id)
  created_at
  updated_by (user_id)
  updated_at
  published_at (null = draft)
}

knowledge_categories {
  id
  name ('Procedures', 'Manuals', 'Safety', 'Maintenance', etc.)
  description
}
```

---

## 8. AI Knowledge Assistant

**Purpose:** Operational guidance grounded on approved documents  
**Architecture:** RAG (Retrieval-Augmented Generation)
- **Retriever:** Search knowledge articles for relevant context
- **Prompt:** Augment user query with retrieved documents
- **Generator:** LLM responds with citations

**Safety:**
- Only indexed documents are used
- Responses include document citations
- Hallucination minimized (no knowledge not in documents)
- Moderation on sensitive operational queries

**Data Storage:**
```
ai_knowledge_index {
  id
  article_id (foreign key to knowledge_articles)
  chunk_index (int; article may have multiple chunks)
  embedding (vector; from OpenAI / Cohere / etc.)
  text (chunk of article; max 1000 tokens)
}
```

---

## 9. Sharing & Exports

**Purpose:** Collaborative analysis without granting edit access  
**Sharing Model:**
- Grantor (e.g., Regional Admin) shares data
- Grantee (e.g., external analyst) receives view-only access
- Scope can be limited (station, date range, parameters)

**Grantee Capabilities:**
- View data in reports
- Filter + search
- Export Excel/PDF
- Cannot edit source data

**Data Storage:**
```
sharing_grants {
  id
  grantor_id (user_id)
  grantee_id (user_id or email for external)
  resource_type ('station', 'readings', 'sla', 'interruptions')
  resource_id (station_id, equipment_id, etc.)
  scope (JSONB; date_range: {start, end}, parameters: [list])
  expires_at (datetime; null = permanent)
  created_at
  revoked_at (timestamp or null)
}
```

---

## 10. Audit & Compliance

**Purpose:** Track all user actions for compliance + debugging  
**Logged Events:**
- User login/logout
- Data edits (readings, SLA, interruptions, inspections)
- Approvals (supervisor sign-off)
- Exports (who exported what, when)
- Sharing grants (issued, revoked)
- Formula changes (versioning)
- Month sealing

**Data Storage:**
```
audit_logs {
  id
  user_id
  action ('read', 'create', 'update', 'delete', 'export', 'approve', 'share', 'seal')
  resource_type ('reading', 'sla', 'interruption', 'inspection', 'month', 'share')
  resource_id
  old_value (JSONB; before edit)
  new_value (JSONB; after edit)
  ip_address
  user_agent
  created_at
}
```

**Sealed Month Enforcement:**
```
-- Cannot UPDATE readings WHERE sealed_at IS NOT NULL
-- Can still SELECT and ANALYZE with formulas
```

---

## Module Interdependencies

```
Readings → SLA (SLA uses readings for actual MW)
Readings → Reports (reports consume readings data)
SLA → Reports (reports consume SLA data)
Interruptions → Reports (reports track MTTR, frequency)
Inspections → Reports (reports list inspections)
All → Audit Logs (every action logged)
Knowledge → AI Assistant (AI indexes knowledge)
Sharing → Grantee Permissions (sharing controls visibility)
Templates → Readings, Inspections (define form structure)
Formulas → Readings, SLA (calculated fields)
Month Seal → All (seals all records for a month)
```

---

## Future Module Ideas

- **Forecasting** — ML-based load/generation forecasts
- **Predictive Maintenance** — Anomaly detection on readings
- **Dashboard Builder** — User-customizable dashboards
- **Notifications** — Email/SMS/WhatsApp alerts
- **Mobile App** — iOS/Android for field operations
- **SCADA Integration** — Real-time ingestion from control systems
- **Workspaces** — Collaborative spaces for teams

---

**Last Updated:** May 8, 2026  
**Status:** MVP Phase 1 Complete
