# NISO Developer Handoff Package

Complete guide for developers integrating the NISO platform with backend services.

---

## Project Structure

```
niso/
├── frontend/
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── service-worker.js       # Offline support
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # v2 with Advanced Reporting
│   │   │   ├── Mobile.jsx          # Field operators
│   │   │   ├── Responsive.jsx      # Multi-device
│   │   │   ├── TemplateBuilder.jsx
│   │   │   └── NotificationHub.jsx # v3
│   │   ├── components/
│   │   │   ├── ApiClient.js        # Fetch wrapper
│   │   │   ├── OfflineStore.js     # IndexedDB manager
│   │   │   ├── WebSocketManager.js # Socket.io wrapper
│   │   │   ├── Charts.jsx          # SLA visualization
│   │   │   └── Forms.jsx           # Readings input
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useOffline.js
│   │   │   ├── useRealtime.js
│   │   │   └── useSyncQueue.js
│   │   └── index.html
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js               # Express + Socket.io
│   │   ├── config/
│   │   │   ├── database.js         # PostgreSQL
│   │   │   ├── redis.js
│   │   │   └── env.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── rbac.js             # Role checking
│   │   │   ├── rateLimit.js
│   │   │   └── auditLog.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── readings.js
│   │   │   ├── equipment.js
│   │   │   ├── sla.js
│   │   │   ├── templates.js
│   │   │   ├── alerts.js
│   │   │   ├── reports.js
│   │   │   └── audit.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Equipment.js
│   │   │   ├── Reading.js
│   │   │   ├── SLA.js
│   │   │   ├── Template.js
│   │   │   └── Alert.js
│   │   ├── services/
│   │   │   ├── AuthService.js
│   │   │   ├── ReadingService.js   # Validation + storage
│   │   │   ├── SLACalculator.js    # Variance logic
│   │   │   ├── ReportGenerator.js  # PDF/CSV exports
│   │   │   ├── EmailQueue.js       # Scheduled reports
│   │   │   ├── WebSocketManager.js # Broadcasting
│   │   │   └── OfflineSyncManager.js
│   │   ├── websocket/
│   │   │   └── handlers.js         # Event handlers
│   │   └── jobs/
│   │       ├── dailyReports.js
│   │       ├── monthlySealing.js
│   │       └── alertThresholds.js
│   ├── migrations/
│   │   ├── 001-init.sql            # Initial schema
│   │   └── 002-indices.sql         # Performance indexes
│   ├── tests/
│   │   ├── api.test.js
│   │   ├── sla.test.js
│   │   └── websocket.test.js
│   ├── .env.example
│   ├── package.json
│   └── docker-compose.yml          # Local dev setup
│
├── docs/
│   ├── API.md                      # Endpoint docs
│   ├── WEBSOCKET.md                # Real-time events
│   ├── PWA.md                      # Offline setup
│   ├── DEPLOYMENT.md               # Cloud guides
│   └── ARCHITECTURE.md             # System design
│
└── README.md
```

---

## API Integration Checklist

### Frontend Setup

- [ ] Install dependencies: `npm install`
- [ ] Configure `ApiClient.js` with backend URL
- [ ] Test authentication flow (login → token storage → auto-refresh)
- [ ] Initialize IndexedDB schema in `OfflineStore.js`
- [ ] Register service worker (`public/service-worker.js`)
- [ ] Connect WebSocket manager in main app

### Backend Setup

- [ ] Clone backend repository
- [ ] Create `.env` file from `.env.example`
- [ ] Configure PostgreSQL connection string
- [ ] Configure Redis connection (caching + queues)
- [ ] Run migrations: `npm run migrate`
- [ ] Seed test data: `npm run seed`
- [ ] Start dev server: `npm run dev`

### Local Testing

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Listens on http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm start
# Listens on http://localhost:3001

# Test flow:
# 1. Register new user → /auth/signup
# 2. Login → Store JWT
# 3. Create equipment → POST /api/equipment
# 4. Enter readings → POST /api/readings
# 5. View dashboard → Real-time updates via WebSocket
# 6. Go offline → Readings saved to IndexedDB
# 7. Go online → Auto-sync with POST /api/readings/bulk-sync
```

---

## Key Implementation Details

### 1. Offline-First Architecture

```javascript
// ApiClient.js — Wraps fetch with offline fallback
class ApiClient {
  async request(method, url, data = null) {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: data ? JSON.stringify(data) : null
      });
      return response.json();
    } catch (e) {
      // Network error → save to IndexedDB + queue for sync
      await OfflineStore.enqueue({ method, url, data });
      return { offline: true, queued: true };
    }
  }
}

// On reconnect
window.addEventListener('online', async () => {
  const queue = await OfflineStore.getQueue();
  for (const req of queue) {
    await ApiClient.request(req.method, req.url, req.data);
    await OfflineStore.dequeue(req.id);
  }
});
```

### 2. Real-Time SLA Updates

```javascript
// Server broadcasts when readings come in
socket.on('connection', (socket) => {
  socket.on('subscribe', ({ equipment_id }) => {
    socket.join(`equipment:${equipment_id}`);
  });
});

// After reading saved → recalculate SLA
const sla = await SLACalculator.calculate(equipment_id);
io.to(`equipment:${equipment_id}`).emit('sla:refresh', sla);

// Client receives instantly
socket.on('sla:refresh', (sla) => {
  setKPICard(prev => ({ ...prev, sla }));
});
```

### 3. Month Sealing (Data Freeze)

```javascript
// Check seal status before allowing edits
const canEditReading = async (equipment_id, date) => {
  const seal = await db.query(
    'SELECT status FROM month_seals WHERE station_id = $1 AND EXTRACT(YEAR FROM $2) = year AND EXTRACT(MONTH FROM $2) = month',
    [equipment.station_id, date]
  );
  return seal.status !== 'SEALED'; // Block edits if sealed
};
```

### 4. Email Report Scheduling

```javascript
// Schedule daily SLA reports at 9 AM
await emailQueue.add(
  { user_id, format: 'pdf', type: 'daily-sla' },
  { 
    repeat: { 
      cron: '0 9 * * *',
      tz: 'America/New_York'
    },
    removeOnComplete: true
  }
);

// Job executes, generates PDF, sends email
emailQueue.process('daily-sla', async (job) => {
  const report = await ReportGenerator.generatePDF(job.data);
  await EmailService.send(user.email, report);
});
```

### 5. WebSocket Heartbeat (Connection Health)

```javascript
// Client sends periodic heartbeat
setInterval(() => {
  socket.emit('heartbeat', { user_id });
}, 30000); // Every 30 seconds

// Server tracks active users, broadcasts to subscribers
socket.on('heartbeat', ({ user_id }) => {
  io.emit('users:online', { count: activeConnections.length });
});

// If heartbeat missed 3 times → consider user offline
```

---

## Common Integration Patterns

### Pattern 1: Create Reading (Offline-Safe)

```javascript
// Frontend
const saveReading = async (equipment_id, data) => {
  const reading = { equipment_id, data, timestamp: new Date() };
  
  if (navigator.onLine) {
    return await api.post('/readings', reading);
  } else {
    await offlineDB.add(reading);
    return { offline: true };
  }
};
```

### Pattern 2: Fetch SLA Trend Data

```javascript
// Frontend
const fetchSLATrend = async (equipment_id, days = 30) => {
  const cached = await cache.get(`sla:${equipment_id}`);
  if (cached && !isStale(cached)) return cached;
  
  const data = await api.get(`/sla/${equipment_id}?days=${days}`);
  await cache.set(`sla:${equipment_id}`, data, 5 * 60 * 1000); // 5 min TTL
  return data;
};
```

### Pattern 3: Export Report (Scheduled)

```javascript
// Frontend — Request export
const requestExport = async (type, format) => {
  const job = await api.post('/reports/generate', { type, format });
  
  // Poll for completion
  const checkStatus = setInterval(async () => {
    const report = await api.get(`/reports/${job.id}`);
    if (report.status === 'completed') {
      clearInterval(checkStatus);
      downloadFile(report.url);
    }
  }, 1000);
};

// Backend — Generate in background
app.post('/reports/generate', async (req, res) => {
  const jobId = generateId();
  reportQueue.add({ jobId, ...req.body });
  res.json({ id: jobId, status: 'queued' });
});
```

---

## Performance Optimization Tips

### Frontend
- **Code split** by page (lazy load Dashboard, Mobile, Reports)
- **Memoize** expensive calculations (SLA variance, equipment list)
- **Virtualize** long tables (100+ equipment rows)
- **Cache** API responses with 5–30 min TTL
- **Debounce** form inputs (300ms)

### Backend
- **Index** frequently queried columns: `equipment_id`, `timestamp`, `station_id`
- **Batch insert** readings (10–50 at a time)
- **Use materialized views** for SLA trend queries
- **Cache hot data** in Redis (last 24h readings, current SLA)
- **Archive** old readings (>1 year) to cold storage

### Database
- **Partitioning** — Readings by equipment + date range
- **Replication** — Primary + read replica for reports
- **Backup** — Daily snapshots to S3

---

## Testing Checklist

### Unit Tests
- [ ] AuthService (token generation, validation)
- [ ] SLACalculator (variance formula, edge cases)
- [ ] OfflineStore (queue management, sync logic)

### Integration Tests
- [ ] Complete readings workflow (save → sync → verify)
- [ ] WebSocket subscription (connect → subscribe → receive → disconnect)
- [ ] Month sealing (lock/unlock flow)
- [ ] Email queue (schedule → execute → verify sent)

### E2E Tests (Playwright/Cypress)
- [ ] Login → Dashboard → Equipment selection → Readings entry → Offline sync
- [ ] Real-time SLA updates (open dashboard on 2 tabs, post reading in one, verify refresh in other)
- [ ] Mobile responsive (iPhone 6" portrait → iPad 10" landscape)
- [ ] PWA installation (add to home screen → offline capability)

---

## Monitoring & Alerting

### Key Metrics
- **API Response Time** — Target < 200ms (p95)
- **WebSocket Latency** — Target < 100ms
- **Readings Sync Queue** — Alert if > 100 pending
- **Database Load** — CPU < 60%, Connections < 80%
- **Error Rate** — Alert if > 1%

### Dashboards
- Grafana: Real-time performance + infrastructure
- DataDog: Error tracking + distributed tracing
- Sentry: Exception reporting + session replay

---

## Rollout Strategy

### Phase 1: Internal (Week 1-2)
- Deploy to staging
- Internal team testing (all roles)
- Fix critical bugs

### Phase 2: Pilot (Week 3-4)
- Deploy to production
- Limit to 1 station (50 users)
- Monitor for issues

### Phase 3: Gradual Rollout (Week 5-6)
- 25% of stations (500 users)
- Monitor performance + error rates
- Fix reported issues

### Phase 4: Full Rollout (Week 7-8)
- 100% deployment
- Maintain on-call support
- Plan feature releases

---

## Support & Escalation

### Level 1 — Developer
- Local debugging (npm logs, browser DevTools)
- Check API docs + database schema
- Review recent commits (git log)

### Level 2 — DevOps
- Infrastructure issues (database, Redis, hosting)
- Scaling concerns (load balancer, replication)
- Backup/recovery

### Level 3 — Architect
- System design decisions
- Performance optimization strategies
- Security reviews

---

## Links & Resources

- **API Docs** → `/backend/docs/API.md`
- **WebSocket Events** → `/backend/docs/WEBSOCKET.md`
- **Deployment Guides** → `/backend/docs/DEPLOYMENT.md`
- **Architecture Diagram** → `/docs/ARCHITECTURE.md`

---

**Questions?** Contact the platform team or open an issue in the repository.
