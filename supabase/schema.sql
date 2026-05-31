-- NISO Supabase Schema & RLS Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. TABLES
-- ============================================

-- Stations
CREATE TABLE IF NOT EXISTS stations (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(100),
  location VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stations (name, region, location, code) VALUES
  ('AKANGBA', 'South', 'Lagos', 'AKG'),
  ('OSOGBO', 'South', 'Osun', 'OSO'),
  ('BENIN', 'South', 'Edo', 'BEN'),
  ('AJAOKUTA', 'North', 'Kogi', 'AJK')
ON CONFLICT DO NOTHING;

-- Users (links to Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50), -- 'Operator', 'Supervisor', 'Station Admin', 'Regional Admin', 'HQ Admin', etc.
  station_id BIGINT REFERENCES stations(id),
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  station_id BIGINT NOT NULL REFERENCES stations(id),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  installed_date DATE,
  status VARCHAR(50) DEFAULT 'operating',
  sla_target DECIMAL(5,2) DEFAULT 95.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Readings
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id BIGINT NOT NULL REFERENCES equipment(id),
  station_id BIGINT NOT NULL REFERENCES stations(id),
  reading_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amperage DECIMAL(10,2),
  mw DECIMAL(10,2),
  mvar DECIMAL(10,2),
  kv DECIMAL(10,2),
  temperature DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SLA Records
CREATE TABLE IF NOT EXISTS sla_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id BIGINT NOT NULL REFERENCES equipment(id),
  station_id BIGINT NOT NULL REFERENCES stations(id),
  date DATE NOT NULL,
  forecast_pct DECIMAL(5,2),
  actual_pct DECIMAL(5,2),
  variance DECIMAL(5,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interruptions
CREATE TABLE IF NOT EXISTS interruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id BIGINT NOT NULL REFERENCES equipment(id),
  station_id BIGINT NOT NULL REFERENCES stations(id),
  trip_time TIMESTAMP NOT NULL,
  restore_time TIMESTAMP,
  duration_minutes INTEGER,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id BIGINT NOT NULL REFERENCES equipment(id),
  station_id BIGINT NOT NULL REFERENCES stations(id),
  inspection_date DATE NOT NULL,
  inspector_id UUID REFERENCES users(id),
  findings TEXT,
  status VARCHAR(50) DEFAULT 'in-progress',
  severity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_equipment_station ON equipment(station_id);
CREATE INDEX idx_readings_equipment_time ON readings(equipment_id, reading_time DESC);
CREATE INDEX idx_readings_station ON readings(station_id);
CREATE INDEX idx_sla_equipment_date ON sla_records(equipment_id, date DESC);
CREATE INDEX idx_interruptions_station ON interruptions(station_id);
CREATE INDEX idx_inspections_equipment ON inspections(equipment_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_station ON users(station_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE interruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Helper function to get user station_id
CREATE OR REPLACE FUNCTION get_user_station()
RETURNS BIGINT AS $$
  SELECT station_id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- EQUIPMENT RLS
-- Station users see only their station's equipment
-- Admins see all
CREATE POLICY "equipment_access"
ON equipment
FOR SELECT
USING (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin', 'Regional Admin')
);

CREATE POLICY "equipment_insert"
ON equipment
FOR INSERT
WITH CHECK (
  get_user_role() IN ('Station Admin', 'Regional Admin', 'HQ Admin')
);

-- READINGS RLS
CREATE POLICY "readings_select"
ON readings
FOR SELECT
USING (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin', 'Regional Admin', 'Viewer')
);

CREATE POLICY "readings_insert"
ON readings
FOR INSERT
WITH CHECK (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

CREATE POLICY "readings_update"
ON readings
FOR UPDATE
USING (
  (get_user_role() IN ('Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

-- SLA_RECORDS RLS
CREATE POLICY "sla_select"
ON sla_records
FOR SELECT
USING (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin', 'Regional Admin', 'Viewer')
);

CREATE POLICY "sla_insert"
ON sla_records
FOR INSERT
WITH CHECK (
  get_user_role() IN ('Supervisor', 'Station Admin', 'HQ Admin', 'ICT Admin', 'Regional Admin')
);

-- INTERRUPTIONS RLS
CREATE POLICY "interruptions_select"
ON interruptions
FOR SELECT
USING (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin', 'Regional Admin', 'Viewer')
);

CREATE POLICY "interruptions_insert"
ON interruptions
FOR INSERT
WITH CHECK (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

CREATE POLICY "interruptions_update"
ON interruptions
FOR UPDATE
USING (
  (get_user_role() IN ('Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

-- INSPECTIONS RLS
CREATE POLICY "inspections_select"
ON inspections
FOR SELECT
USING (
  (get_user_role() IN ('Operator', 'Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin', 'Regional Admin', 'Viewer')
);

CREATE POLICY "inspections_insert"
ON inspections
FOR INSERT
WITH CHECK (
  (get_user_role() IN ('Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

CREATE POLICY "inspections_update"
ON inspections
FOR UPDATE
USING (
  (get_user_role() IN ('Supervisor', 'Station Admin') AND station_id = get_user_station())
  OR get_user_role() IN ('HQ Admin', 'ICT Admin')
);

-- USERS RLS (limited access)
CREATE POLICY "users_select"
ON users
FOR SELECT
USING (
  auth.uid() = id OR get_user_role() IN ('HQ Admin', 'Station Admin')
);

-- ============================================
-- 4. DEMO DATA
-- ============================================

-- Demo users (will be created via Supabase Auth UI, then insert here)
-- For testing, manually create these in Supabase Auth, then run:
/*
INSERT INTO users (id, auth_id, email, first_name, last_name, role, station_id) VALUES
  ('operator-1'::uuid, 'auth-operator-1'::uuid, 'operator@akangba.niso', 'John', 'Operator', 'Operator', 1),
  ('supervisor-1'::uuid, 'auth-supervisor-1'::uuid, 'supervisor@akangba.niso', 'Jane', 'Supervisor', 'Supervisor', 1),
  ('admin-global'::uuid, 'auth-admin-1'::uuid, 'admin@niso.global', 'Admin', 'User', 'HQ Admin', NULL);
*/

-- Demo equipment
INSERT INTO equipment (name, type, station_id, model, status, sla_target) VALUES
  ('2SHR TR1', 'Transformer', 1, 'ABB-100MVA', 'operating', 95.0),
  ('2SHR TR2', 'Transformer', 1, 'Siemens-80MVA', 'alert', 95.0),
  ('CONDC-A1', 'Conductor', 1, 'AL-400', 'operating', 95.0),
  ('OSO-TR1', 'Transformer', 2, 'ABB-100MVA', 'operating', 95.0),
  ('BEN-TR1', 'Transformer', 3, 'Siemens-80MVA', 'operating', 95.0)
ON CONFLICT DO NOTHING;

-- Demo readings
INSERT INTO readings (equipment_id, station_id, amperage, mw, mvar, kv, status) VALUES
  (1, 1, 450.5, 750.2, 320.1, 138.5, 'synced'),
  (1, 1, 445.2, 748.5, 318.3, 138.5, 'synced'),
  (2, 1, 380.1, 620.5, 280.2, 138.5, 'pending'),
  (3, 1, 200.0, 350.0, 150.0, 138.5, 'synced')
ON CONFLICT DO NOTHING;
