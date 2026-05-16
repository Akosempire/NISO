# NISO: Data Model & Workflows

## Data Model Overview

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role_id UUID FOREIGN KEY,
  region_id UUID FOREIGN KEY,
  station_id UUID FOREIGN KEY,
  full_name VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

#### regions
```sql
CREATE TABLE regions (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  code VARCHAR UNIQUE,
  headquarters_id UUID FOREIGN KEY (users),
  created_at TIMESTAMP
);
```

#### stations
```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  region_id UUID FOREIGN KEY,
  location VARCHAR,
  created_at TIMESTAMP,
  UNIQUE(name, region_id)
);
```

#### equipment
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  station_id UUID FOREIGN KEY,
  type VARCHAR ('330kV', '132kV', 'Transformer', 'Reactor', 'Feeder'),
  template_id UUID FOREIGN KEY,
  scada_tag VARCHAR (future SCADA integration),
  created_at TIMESTAMP,
  UNIQUE(name, station_id)
);
```

#### parameters
```sql
CREATE TABLE parameters (
  id UUID PRIMARY KEY,
  name VARCHAR,
  unit VARCHAR ('A', 'MW', 'MVAR', 'kV'),
  type VARCHAR ('number', 'code', 'text'),
  equipment_id UUID FOREIGN KEY,
  created_at TIMESTAMP
);
```

#### readings
```sql
CREATE TABLE readings (
  id UUID PRIMARY KEY,
  equipment_id UUID FOREIGN KEY NOT NULL,
  date DATE NOT NULL,
  hour SMALLINT NOT NULL (0-23),
  raw_input VARCHAR,
  numeric_value DECIMAL(10,2),
  code_reference VARCHAR,
  value_type VARCHAR ('number', 'code', 'text'),
  created_by UUID FOREIGN KEY (users) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID FOREIGN KEY (users),
  updated_at TIMESTAMP,
  sealed_at TIMESTAMP (null = editable, filled = immutable),
  
  UNIQUE(equipment_id, date, hour),
  INDEX(equipment_id, date),
  INDEX(created_by),
  INDEX(sealed_at)
);
```

#### sla_entries
```sql
CREATE TABLE sla_entries (
  id UUID PRIMARY KEY,
  station_id UUID FOREIGN KEY NOT NULL,
  date DATE NOT NULL,
  hour SMALLINT NOT NULL,
  forecast_mw DECIMAL(10,2) NOT NULL,
  meter_reading_kwh DECIMAL(15,2),
  actual_mw DECIMAL(10,2),
  difference_mw DECIMAL(10,2) GENERATED ALWAYS AS (actual_mw - forecast_mw),
  remarks TEXT,
  created_by UUID FOREIGN KEY (users),
  created_at TIMESTAMP,
  approved_by UUID FOREIGN KEY (users),
  approved_at TIMESTAMP,
  sealed_at TIMESTAMP,
  
  UNIQUE(station_id, date, hour),
  INDEX(station_id, date),
  INDEX(approved_at)
);
```

#### interruptions
```sql
CREATE TABLE interruptions (
  id UUID PRIMARY KEY,
  equipment_id UUID FOREIGN KEY NOT NULL,
  trip_time TIMESTAMP NOT NULL,
  restoration_time TIMESTAMP,
  cause_code VARCHAR ('RELAY_FLT', 'CB_FLT', 'TRIP_MANUAL', 'MNT', etc.),
  duration_seconds INT GENERATED ALWAYS AS (
    CASE WHEN restoration_time IS NOT NULL 
    THEN EXTRACT(EPOCH FROM restoration_time - trip_time)
    ELSE NULL END
  ),
  notes TEXT,
  status VARCHAR ('Active', 'Restored', 'Cleared') DEFAULT 'Active',
  created_by UUID FOREIGN KEY (users),
  created_at TIMESTAMP,
  resolved_by UUID FOREIGN KEY (users),
  resolved_at TIMESTAMP,
  
  INDEX(equipment_id, trip_time),
  INDEX(status),
  INDEX(created_at)
);
```

#### inspections
```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  equipment_id UUID FOREIGN KEY NOT NULL,
  inspection_date TIMESTAMP NOT NULL,
  type_id UUID FOREIGN KEY (inspection_types),
  inspector_id UUID FOREIGN KEY (users) NOT NULL,
  findings JSONB,
  photos JSONB (array of URLs),
  created_at TIMESTAMP,
  approved_by UUID FOREIGN KEY (users),
  approved_at TIMESTAMP,
  
  INDEX(equipment_id, inspection_date),
  INDEX(inspector_id),
  INDEX(approved_at)
);
```

#### templates
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  station_id UUID FOREIGN KEY,
  fields JSONB (array of field definitions),
  created_by UUID FOREIGN KEY (users),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(name, station_id)
};
```

#### formulas
```sql
CREATE TABLE formulas (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  template_id UUID FOREIGN KEY,
  expression VARCHAR NOT NULL (e.g., "=(field1 * field2)/1000"),
  version INT NOT NULL,
  activated_at TIMESTAMP,
  created_by UUID FOREIGN KEY (users),
  created_at TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  
  INDEX(template_id, is_active),
  INDEX(activated_at)
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  action VARCHAR ('create', 'update', 'delete', 'export', 'approve', 'seal'),
  resource_type VARCHAR ('reading', 'sla', 'interruption', 'inspection', 'month'),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX(user_id, created_at),
  INDEX(resource_type, resource_id),
  INDEX(created_at)
);
```

#### sharing
```sql
CREATE TABLE sharing (
  id UUID PRIMARY KEY,
  grantor_id UUID FOREIGN KEY (users) NOT NULL,
  grantee_id UUID FOREIGN KEY (users),
  grantee_email VARCHAR (for external users),
  resource_type VARCHAR ('station', 'equipment', 'readings'),
  resource_id UUID,
  scope JSONB (e.g., { "date_range": {"start": "2026-05-01", "end": "2026-05-31"}, "parameters": ["amp", "mw"] }),
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  INDEX(grantee_id, created_at),
  INDEX(grantor_id, created_at)
);
```

---

## Key Workflows

### Workflow 1: Daily Shift Reading Entry

```
Operator logs in
  ↓
Dashboard shows: current shift, active interruptions, SLA status
  ↓
Clicks "Hourly Readings"
  ↓
Selects Date: [Today] and Hour: [18:00]
  ↓
System queries: SELECT * FROM readings WHERE equipment_id IN (...) AND date = TODAY AND hour = 18
  ↓
Shows equipment queue: [2JEB-KNJ1, 2JEB-KNJ2, KNJ-FDR1, ...]
  ↓
Operator clicks "2JEB-KNJ1" → Drawer opens
  ↓
Drawer shows:
  - Equipment ID + type
  - Form fields (AMP, MW, MVAR, KV)
  - Previous hour values (readonly)
  ↓
Operator enters: AMP=250, MW=125, MVAR=98, KV=330
  ↓
Clicks "Save & Next"
  ↓
INSERT INTO readings VALUES (...)
  ↓
Drawer closes, next equipment opens (2JEB-KNJ2)
  ↓
Repeat until all equipment entered
```

### Workflow 2: SLA Review & Approval

```
Operator fills SLA entry:
  - Meter Reading: 5450 MWh
  - Actual MW: 108 MW
  ↓
System auto-calculates: Difference = 108 - 110 (forecast) = -2 MW
  ↓
Status: "On Track" (green)
  ↓
Supervisor logs in → Clicks "Review & Approval"
  ↓
Views pending SLA entries
  ↓
Supervisor approves (or requests correction)
  ↓
UPDATE sla_entries SET approved_by = supervisor_id, approved_at = NOW()
  ↓
At end of month, Regional Admin seals month:
  UPDATE readings SET sealed_at = NOW() WHERE date IN (month_range)
  ↓
Historical data locked; formulas can still be re-analyzed
```

### Workflow 3: Interruption Reporting

```
Equipment relay fault occurs at 18:15
  ↓
Operator clicks "Interruptions" → "+ New"
  ↓
Drawer opens; selects Equipment: "2JEB-KNJ1"
  ↓
Selects Cause: "Relay Fault"
  ↓
Enters Trip Time: 2026-05-08 18:15
  ↓
Clicks "Save Interruption"
  ↓
INSERT INTO interruptions (equipment_id, trip_time, status='Active')
  ↓
Equipment trips remaining; Operator can multi-select and record all affected in one session
  ↓
Later, when relay restored at 20:45:
  Operator opens interruption record
  Enters Restoration Time: 2026-05-08 20:45
  Clicks "Save"
  ↓
UPDATE interruptions SET restoration_time = NOW(), status = 'Restored'
  ↓
System calculates: Duration = 20:45 - 18:15 = 2h 30m
  ↓
Report shows: Equipment downtime, MTTR trending
```

### Workflow 4: Formula Change & Historical Re-Analysis

```
Admin realizes: "MW formula should be (Voltage * Current)/1000, not /100"
  ↓
Clicks "System" → "Formula Engine"
  ↓
Finds formula: "MW Calculation"
  ↓
Edits expression: "=(kv * amp)/100" → "=(kv * amp)/1000"
  ↓
Clicks "Save"
  ↓
System:
  1. Creates new formula version (version = 2)
  2. Sets activated_at = NOW()
  3. Marks old version (version = 1) as inactive
  ↓
Going forward, all new readings use formula v2
  ↓
Historical data stays unchanged (raw inputs preserved)
  ↓
Report builder can query:
  SELECT reading, formula_v1_result, formula_v2_result
  FROM readings JOIN formulas ...
  ↓
Operator can compare: "what if we'd used the old formula?"
```

### Workflow 5: Regional Overview (Regional Admin)

```
Regional Admin logs in
  ↓
Dashboard shows:
  - All stations in region (overview grid)
  - Active interruptions (region-wide)
  - SLA compliance (regional aggregate)
  ↓
Clicks "Stations" → sees: Kainji, Akangba, Jebba, ...
  ↓
Clicks "Kainji" → Drills down to station
  ↓
Views all equipment, readings, SLA, interruptions for Kainji only
  ↓
Cannot see Akangba data (region isolation)
  ↓
Clicks "Reports" → generates "Regional SLA Report"
  ↓
System aggregates all stations' SLA data
  ↓
Export as Excel/PDF
```

---

## Permission Enforcement

### Backend Filter Pattern

```javascript
// Example: List readings for current user
const getReadings = async (userId, dateRange) => {
  const user = await getUserRole(userId);
  
  let query = 'SELECT * FROM readings r JOIN equipment e ON r.equipment_id = e.id';
  
  if (user.role === 'operator') {
    // Operator sees only their station
    query += ` WHERE e.station_id = ? AND r.date BETWEEN ? AND ?`;
    return db.query(query, [user.station_id, dateRange.start, dateRange.end]);
  } 
  else if (user.role === 'regional_admin') {
    // Regional Admin sees only their region
    query += ` WHERE e.station_id IN (SELECT id FROM stations WHERE region_id = ?) AND r.date BETWEEN ? AND ?`;
    return db.query(query, [user.region_id, dateRange.start, dateRange.end]);
  }
  else if (user.role === 'headquarters_admin') {
    // HQ sees all
    query += ` WHERE r.date BETWEEN ? AND ?`;
    return db.query(query, [dateRange.start, dateRange.end]);
  }
};
```

---

## Month Lifecycle State Machine

```
Open (default)
  └─ Can: INSERT, UPDATE readings
     Supervisor: Initiates review
       ↓
Review
  └─ Can: Review data, REQUEST CORRECTIONS
     Regional Admin: Approves or rejects
       ↓
Sealed
  └─ Can: SELECT (read), ANALYZE (formulas), EXPORT
     Cannot: INSERT, UPDATE, DELETE raw readings
     Can: Re-run formulas on historical data
```

---

**Last Updated:** May 8, 2026  
**For:** Backend developers, database admins, future maintainers
