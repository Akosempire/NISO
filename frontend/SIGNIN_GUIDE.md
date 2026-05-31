# NISO Sign In & Authentication Guide

## Overview

NISO uses **dual-scope authentication** to handle both station-level operators and global administrators:

### **Station Scope** (Default)
- **Roles**: Operator, Supervisor, Station Admin
- **Access**: Limited to assigned station only
- **Login flow**: User selects their station → enters credentials → sees only station data
- **Permissions**:
  - Operator: Can create readings, view data
  - Supervisor: Can create readings, approve/review, create interruptions
  - Station Admin: Full station management

### **Admin Scope**
- **Roles**: HQ Admin, ICT Admin, Regional Admin
- **Access**: Regional or global data
- **Login flow**: Skips station selection → enters credentials → sees assigned region/global data
- **Permissions**:
  - Regional Admin: Can see all stations in region
  - HQ Admin: Full system access
  - ICT Admin: Infrastructure management

### **Read-Only Scope**
- **Roles**: Viewer, Knowledge Admin
- **Access**: Can view all data (no edits)

---

## How It Works

### 1. **Sign In Flow**

```
User arrives → Chooses "Station User" or "Admin"
  ↓
If "Station User":
  - Sees dropdown of available stations
  - Selects their station
  - Enters email/password
  - System verifies role matches station scope
  ↓
If "Admin":
  - Skips station selection
  - Enters email/password
  - System verifies role is admin-level
  ↓
Login successful → User sees only data for their scope
```

### 2. **Data Isolation**

Every query automatically filters based on user's scope:

```javascript
// If user is Station Admin at AKANGBA:
const readings = await queryBuilder.readings(scope)
// Returns only readings from AKANGBA

// If user is HQ Admin:
const readings = await queryBuilder.readings(scope)
// Returns readings from all stations
```

### 3. **Role-Based Display**

The UI adapts based on the user's scope:

- **Station users** see: Their station name, equipment, readings, interruptions
- **Regional admins** see: All stations in region, comparative dashboards
- **HQ admins** see: All data, user management, system settings
- **Viewers** see: Read-only dashboards, no edit buttons

---

## Implementation Details

### Database Schema (users table)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50), -- 'Operator', 'Supervisor', 'Station Admin', 'Regional Admin', 'HQ Admin', etc.
  station_id INTEGER REFERENCES stations(id), -- NULL for admin roles
  region_id INTEGER REFERENCES regions(id),   -- NULL for global or station roles
  created_at TIMESTAMP
);
```

### Supabase RLS Policies

```sql
-- Users can only see their own station's data
CREATE POLICY "users_see_own_station"
  ON readings
  FOR SELECT
  USING (
    -- Station users see only their station
    (auth.jwt() ->> 'role' = ANY(ARRAY['Operator', 'Supervisor', 'Station Admin']) 
     AND station_id = (SELECT station_id FROM users WHERE auth_id = auth.uid()))
    -- Admins see all
    OR auth.jwt() ->> 'role' = ANY(ARRAY['HQ Admin', 'ICT Admin', 'Regional Admin'])
  );

-- Similar policy for interruptions, inspections, etc.
```

### Frontend Usage

```javascript
// On login, determine scope:
const scope = {
  type: 'station',      // or 'region', 'global', 'viewer'
  stationId: 1,
  canEdit: true,
  canApprove: false
};

// Use scope in queries:
const readings = await queryBuilder.readings(scope);

// UI shows/hides based on scope:
{scope.canEdit && <button>+ New Reading</button>}
{scope.canApprove && <button>Approve</button>}
{scope.type === 'global' && <button>Manage Users</button>}
```

---

## Demo Accounts

| Role | Email | Password | Station | Scope |
|------|-------|----------|---------|-------|
| Operator | operator@akangba.niso | password123 | AKANGBA | Station |
| Supervisor | supervisor@akangba.niso | password123 | AKANGBA | Station |
| Station Admin | admin@akangba.niso | password123 | AKANGBA | Station |
| Regional Admin | admin@south.niso | password123 | - | Region (South) |
| HQ Admin | admin@niso.global | password123 | - | Global |

---

## Security Considerations

1. **RLS (Row Level Security)**: Supabase enforces data access at database level
2. **Token-based**: JWT tokens include role but NOT station ID (prevents tampering)
3. **Server-side validation**: Every write operation verifies user scope
4. **Audit logging**: All cross-scope access attempts are logged

---

## Setting Up Supabase

1. Create a Supabase project
2. Create `users` table with RLS policies
3. Create corresponding `readings`, `interruptions`, `inspections` tables
4. Set up RLS policies to enforce scope isolation
5. Update `.env` with Supabase URL and anon key
