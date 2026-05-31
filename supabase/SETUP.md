# Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `niso-platform`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Wait for project to initialize (2-3 minutes)

### 2. Get Your Credentials

In Supabase dashboard:
1. Go to **Settings > API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
3. Store these securely

### 3. Create Database Schema

**Option A: Using SQL Editor (Easiest)**

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/schema.sql`
4. Paste into editor
5. Click **Run**

**Option B: Using CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Run schema
supabase db push
```

**Option C: Using bash script**

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
export SUPABASE_PASSWORD="your-db-password"

bash ./supabase/setup.sh
```

### 4. Create Demo Users

In Supabase **Authentication > Users**, click **"Add User"** and create:

| Email | Password | Role |
|-------|----------|------|
| operator@akangba.niso | password123 | (user auth) |
| supervisor@akangba.niso | password123 | (user auth) |
| admin@niso.global | password123 | (user auth) |

Then, go to **SQL Editor** and insert user profiles:

```sql
INSERT INTO users (id, auth_id, email, first_name, last_name, role, station_id) VALUES
  (
    'user-uuid-here',  -- Get from users list in Auth tab
    'auth-uuid-here',  -- Get from users list in Auth tab
    'operator@akangba.niso',
    'John',
    'Doe',
    'Operator',
    1  -- AKANGBA station
  );
```

### 5. Configure Frontend

Create `frontend/.env.local`:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Or update the HTML file directly:

```javascript
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### 6. Enable RLS Policies

The `schema.sql` file creates all RLS policies automatically. Verify they're enabled:

1. Go to **Authentication > Policies**
2. You should see policies for each table:
   - `equipment_access`
   - `readings_select`, `readings_insert`, `readings_update`
   - `sla_select`, `sla_insert`
   - `interruptions_select`, `interruptions_insert`, `interruptions_update`
   - `inspections_select`, `inspections_insert`, `inspections_update`

## Testing

### Test Station User Access

1. Login as `operator@akangba.niso`
2. Select station: AKANGBA
3. Should see:
   - Only AKANGBA equipment
   - Only AKANGBA readings
   - Cannot see other stations' data

### Test Admin Access

1. Login as `admin@niso.global`
2. Select scope: Admin
3. Should see:
   - All stations' equipment
   - All readings across all stations
   - Can manage users

### Test RLS Enforcement

1. Open browser DevTools → Network
2. Look at API responses
3. Verify:
   - Station users never receive other stations' data
   - RLS enforced at database level (not just frontend)

## Troubleshooting

### "User not found" error

**Cause**: User doesn't exist in `users` table

**Fix**: 
```sql
SELECT * FROM users WHERE email = 'operator@akangba.niso';
```

If empty, insert the user profile.

### "Permission denied" error

**Cause**: RLS policy blocking access

**Check**:
1. Is user's role correct?
2. Does station_id match?
3. Are RLS policies enabled?

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('readings', 'equipment', 'interruptions');
```

### Readings not appearing

**Cause**: Station filter not matching

**Debug**:
```sql
-- Check what the query sees
SELECT * FROM readings 
WHERE station_id = (SELECT station_id FROM users WHERE auth_id = auth.uid());
```

### Real-time not working

**Enable real-time**:
1. Go to **Replication** in Supabase
2. Enable for each table:
   - readings
   - interruptions
   - inspections
   - sla_records

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Users table has proper constraints
- [ ] No direct DB URL exposed in frontend
- [ ] Using anon key (not service role) in frontend
- [ ] Demo users removed before production
- [ ] Strong database password set
- [ ] IP whitelist configured (if needed)

## Next Steps

1. **Connect frontend** to Supabase using credentials
2. **Create more demo data** (more stations, equipment, users)
3. **Test all roles** to ensure RLS works
4. **Set up real-time listeners** for live updates
5. **Add backup policy** for production

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
