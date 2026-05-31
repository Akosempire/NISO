-- NISO Database Schema

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
  ('HQ Admin', 'Full system access'),
  ('ICT Admin', 'Infrastructure & system management'),
  ('Regional Admin', 'Regional oversight'),
  ('Station Admin', 'Station-level admin'),
  ('Supervisor', 'Operational supervisor'),
  ('Operator', 'Field operator'),
  ('Viewer', 'Read-only access'),
  ('Knowledge Admin', 'Documentation manager')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(255),
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

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INTEGER REFERENCES roles(id),
  station_id INTEGER REFERENCES stations(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  station_id INTEGER REFERENCES stations(id),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  installed_date DATE,
  status VARCHAR(50) DEFAULT 'operating',
  sla_target DECIMAL(5,2) DEFAULT 95.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id INTEGER REFERENCES equipment(id),
  station_id INTEGER REFERENCES stations(id),
  reading_time TIMESTAMP NOT NULL,
  amperage DECIMAL(10,2),
  mw DECIMAL(10,2),
  mvar DECIMAL(10,2),
  kv DECIMAL(10,2),
  temperature DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id INTEGER REFERENCES equipment(id),
  station_id INTEGER REFERENCES stations(id),
  date DATE NOT NULL,
  forecast_pct DECIMAL(5,2),
  actual_pct DECIMAL(5,2),
  variance DECIMAL(5,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id INTEGER REFERENCES equipment(id),
  station_id INTEGER REFERENCES stations(id),
  trip_time TIMESTAMP NOT NULL,
  restore_time TIMESTAMP,
  duration_minutes INTEGER,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id INTEGER REFERENCES equipment(id),
  station_id INTEGER REFERENCES stations(id),
  inspection_date DATE NOT NULL,
  inspector_id UUID REFERENCES users(id),
  findings TEXT,
  status VARCHAR(50) DEFAULT 'in-progress',
  severity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  severity VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id INTEGER REFERENCES stations(id),
  report_type VARCHAR(100),
  title VARCHAR(255),
  content BYTEA,
  format VARCHAR(10),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_readings_equipment_time ON readings(equipment_id, reading_time);
CREATE INDEX idx_readings_station ON readings(station_id);
CREATE INDEX idx_sla_equipment_date ON sla_records(equipment_id, date);
CREATE INDEX idx_interruptions_station ON interruptions(station_id);
CREATE INDEX idx_inspections_equipment ON inspections(equipment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_users_email ON users(email);
