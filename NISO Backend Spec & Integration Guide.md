# NISO Backend Integration Guide

## Overview
Complete specification for PostgreSQL + Node.js API + WebSocket + PWA + Email Reports infrastructure.

---

## 1. Database Schema (PostgreSQL)

### Core Tables

```sql
-- Users & Roles
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- Operator, Supervisor, Station Admin, Regional Admin, HQ Admin, Viewer
  station_id INT,
  region_id INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stations & Regions
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region_id INT REFERENCES regions(id),
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  station_id INT REFERENCES stations(id),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(50),
  template_id INT,
  status VARCHAR(20), -- operating, alert, critical
  last_reading_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Readings (Operational Data)
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  equipment_id INT REFERENCES equipment(id),
  station_id INT REFERENCES stations(id),
  user_id INT REFERENCES users(id),
  data JSONB, -- { amperage, mw, mvar, voltage, ... }
  timestamp TIMESTAMP NOT NULL,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_equipment_timestamp (equipment_id, timestamp)
);

-- SLA & Forecasts
CREATE TABLE sla_targets (
  id SERIAL PRIMARY KEY,
  equipment_id INT REFERENCES equipment(id),
  station_id INT REFERENCES stations(id),
  target_percentage DECIMAL(5,2),
  forecast_percentage DECIMAL(5,2),
  actual_percentage DECIMAL(5,2),
  variance DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_equipment_date (equipment_id, date)
);

-- Equipment Templates
CREATE TABLE equipment_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  equipment_name VARCHAR(255),
  description TEXT,
  fields JSONB, -- { name, type, required, validation, ... }
  version INT DEFAULT 1,
  status VARCHAR(20), -- DRAFT, PUBLISHED
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Template Versions (History)
CREATE TABLE template_versions (
  id SERIAL PRIMARY KEY,
  template_id INT REFERENCES equipment_templates(id),
  version INT,
  status VARCHAR(20),
  changes_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts & Notifications
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  equipment_id INT REFERENCES equipment(id),
  alert_type VARCHAR(50), -- SLA, Maintenance, Threshold
  severity VARCHAR(20), -- critical, warning, info
  message TEXT,
  acknowledged_by INT REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(50), -- create, read, update, delete
  resource_type VARCHAR(50), -- reading, sla, equipment
  resource_id INT,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_action (user_id, action)
);

-- Month Sealing
CREATE TABLE month_seals (
  id SERIAL PRIMARY KEY,
  station_id INT REFERENCES stations(id),
  year INT,
  month INT,
  status VARCHAR(20), -- OPEN, REVIEW, SEALED
  sealed_by INT REFERENCES users(id),
  sealed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(station_id, year, month)
);

-- Email Reports (Queue)
CREATE TABLE email_reports (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  report_type VARCHAR(50), -- daily, weekly, monthly
  recipient_email VARCHAR(255),
  schedule VARCHAR(20), -- 09:00, every-monday, first-of-month
  last_sent_at TIMESTAMP,
  next_send_at TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WebSocket Connections (Live Sessions)
CREATE TABLE websocket_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  connection_id VARCHAR(255) UNIQUE,
  device_type VARCHAR(50), -- web, mobile, tablet
  last_heartbeat TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Node.js API Endpoints

### Authentication
```
POST   /api/auth/login                 → { token, user }
POST   /api/auth/logout                → { success }
POST   /api/auth/refresh               → { token }
```

### Readings (Core Operations)
```
POST   /api/readings                   → Create reading (offline sync)
GET    /api/readings?equipment=X&days=7  → Fetch readings
PUT    /api/readings/:id               → Update reading
DELETE /api/readings/:id               → Delete reading
POST   /api/readings/bulk-sync         → Sync offline queue
```

### Equipment
```
GET    /api/equipment                  → List (scope-filtered)
GET    /api/equipment/:id              → Detail + history
POST   /api/equipment                  → Create
PUT    /api/equipment/:id              → Update
GET    /api/equipment/:id/status       → Real-time status
```

### SLA & Forecasts
```
GET    /api/sla?station=X&days=30      → SLA trend data
GET    /api/sla/:equipment_id          → Equipment SLA detail
PUT    /api/sla/:id                    → Update forecast
POST   /api/sla/calculate              → Recalculate variance
```

### Templates
```
GET    /api/templates                  → List templates
POST   /api/templates                  → Create template
PUT    /api/templates/:id              → Update (auto-version)
GET    /api/templates/:id/versions     → Version history
POST   /api/templates/:id/rollback     → Rollback to version
```

### Alerts & Notifications
```
GET    /api/alerts?severity=critical   → Fetch alerts
POST   /api/alerts/:id/acknowledge     → Ack alert
DELETE /api/alerts/:id                 → Dismiss
GET    /api/alerts/threshold-config    → Get thresholds
PUT    /api/alerts/threshold-config    → Set thresholds
```

### Audit & Compliance
```
GET    /api/audit-log?user=X&days=30   → Audit trail
GET    /api/month-seals                → Seal status
POST   /api/month-seals/:id/seal       → Seal month
```

### Reports & Export
```
GET    /api/reports/sla-trend?format=json  → JSON export
GET    /api/reports/sla-trend?format=csv   → CSV export
POST   /api/reports/generate-pdf           → PDF export (queue)
GET    /api/reports/pdf/:id                → Fetch generated PDF
```

### Email Reports
```
POST   /api/email-reports              → Schedule report
GET    /api/email-reports              → List scheduled reports
PUT    /api/email-reports/:id          → Update schedule
DELETE /api/email-reports/:id          → Cancel report
POST   /api/email-reports/send-now     → Send immediately
```

---

## 3. WebSocket Events (Real-Time Sync)

### Client → Server
```javascript
socket.emit('subscribe', { equipment_id: 1 })
socket.emit('unsubscribe', { equipment_id: 1 })
socket.emit('reading:create', { equipment_id, data })
socket.emit('alert:ack', { alert_id })
socket.emit('heartbeat', { user_id })
```

### Server → Client
```javascript
socket.emit('reading:update', { equipment_id, data })
socket.emit('sla:refresh', { equipment_id, sla_data })
socket.emit('alert:new', { alert_id, message, severity })
socket.emit('status:change', { equipment_id, status })
socket.emit('users:online', { count, list })
socket.emit('month:sealed', { station_id, month })
```

---

## 4. PWA Setup (Service Worker)

### manifest.json
```json
{
  "name": "NISO Field Operations",
  "short_name": "NISO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

### Service Worker Strategy
- **Network-first** for API calls (sync fallback to IndexedDB)
- **Cache-first** for static assets (CSS, JS, images)
- **Stale-while-revalidate** for SLA data

---

## 5. Email Reports (Scheduled)

### Implementation (Node.js + Bull Queue)
```javascript
const emailQueue = new Queue('reports', redisUrl);

emailQueue.process('daily-sla', async (job) => {
  const { user_id, format } = job.data;
  const report = await generateReport(user_id, format);
  await sendEmail(user.email, report);
  return { success: true };
});

// Schedule daily at 9 AM
const dailyJob = emailQueue.add(
  { user_id, format: 'pdf' },
  { repeat: { cron: '0 9 * * *' }, removeOnComplete: true }
);
```

---

## 6. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React SPA)                │
│ - NISO v2 (Desktop)                         │
│ - NISO Mobile (iPhone/iPad)                 │
│ - Responsive Desktop                        │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────┐
│    API Gateway / Load Balancer              │
│  (Nginx / AWS ELB)                          │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        ↓                    ↓
    ┌─────────────┐    ┌──────────────┐
    │ Node.js API │    │ WebSocket    │
    │ (Express)   │    │ Server (ws)  │
    │             │    │              │
    │ - Auth      │    │ - Live SLA   │
    │ - Readings  │    │ - Alerts     │
    │ - Reports   │    │ - Sync       │
    └──────┬──────┘    └──────┬───────┘
           │                  │
           └────────┬─────────┘
                    ↓
         ┌──────────────────────┐
         │  PostgreSQL DB       │
         │  - Readings          │
         │  - SLA               │
         │  - Equipment         │
         │  - Audit Log         │
         └──────────────────────┘
           
         ┌──────────────────────┐
         │  Redis (Caching)     │
         │  - Sessions          │
         │  - Real-time data    │
         │  - Job Queue         │
         └──────────────────────┘

         ┌──────────────────────┐
         │  Bull Queue          │
         │  - Email Reports     │
         │  - PDF Generation    │
         │  - Data Exports      │
         └──────────────────────┘
```

---

## 7. Security & Performance

### Authentication
- JWT tokens (30 min expiry, refresh token)
- Role-based access control (RBAC) middleware
- Request signing for sensitive operations

### Rate Limiting
- 100 req/min per IP (API)
- 1000 req/min per user (WebSocket)

### Data Encryption
- TLS 1.3 for all transport
- Sensitive fields encrypted at rest (password, PII)
- Audit log immutable (append-only)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (DataDog)
- Log aggregation (ELK Stack)

---

## 8. Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1. DB & API** | 2 weeks | Schema, endpoints, auth |
| **2. WebSocket** | 1 week | Real-time sync, alerts |
| **3. PWA Setup** | 3 days | Service worker, offline |
| **4. Email Reports** | 1 week | Queue, scheduling, export |
| **5. Testing & Docs** | 1 week | Integration tests, handoff docs |
| **TOTAL** | ~5 weeks | Production-ready |

---

## 9. Deployment Checklist

- [ ] PostgreSQL database provisioned (AWS RDS / DigitalOcean)
- [ ] Redis cluster for caching & queues
- [ ] Node.js API deployed (Heroku / AWS ECS / DigitalOcean)
- [ ] WebSocket server configured (Socket.io / ws)
- [ ] SSL certificates (Let's Encrypt)
- [ ] CDN configured (CloudFlare / CloudFront)
- [ ] Monitoring & alerting (Sentry, DataDog)
- [ ] Backup & disaster recovery plan
- [ ] Load testing completed (target: 1000 concurrent users)
- [ ] Security audit completed

---

## 10. Frontend Integration Example

```javascript
// NISO Mobile or Desktop app
const api = new ApiClient('https://api.niso.io', token);
const socket = new WebSocket('wss://api.niso.io/ws?token=' + token);

// Save offline reading
const saveReading = async (equipment_id, data) => {
  try {
    await api.post('/readings', { equipment_id, data });
  } catch (e) {
    // Offline: save to IndexedDB
    await offlineDB.readings.add({ equipment_id, data, synced: false });
  }
};

// Real-time SLA updates
socket.on('sla:refresh', (data) => {
  setDashboardState(prev => ({
    ...prev,
    sla: data
  }));
});

// Sync when reconnected
window.addEventListener('online', async () => {
  const pending = await offlineDB.readings.where('synced').equals(false).toArray();
  for (const reading of pending) {
    await api.post('/readings/bulk-sync', [reading]);
    await offlineDB.readings.update(reading.id, { synced: true });
  }
});
```

---

## 11. Support & Maintenance

- **Incident Response** — 1 hour SLA for critical issues
- **Bug Fixes** — 48 hour SLA
- **Performance Optimization** — Quarterly review
- **Security Patches** — As needed
- **Feature Requests** — Backlog prioritization

---

**Next Steps:**
1. Review database schema with your DBA
2. Provision cloud infrastructure (AWS/DigitalOcean/Heroku)
3. Set up CI/CD pipeline (GitHub Actions / GitLab CI)
4. Begin API implementation phase
