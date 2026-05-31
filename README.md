# NISO — Complete Platform Documentation

**NISO** is a **real-time operational dashboard** for power generation stations, featuring offline-first mobile apps, advanced analytics, equipment templating, and full backend integration.

---

## 📦 What You're Getting

### **7 Production HTML Apps**

| App | Purpose | Screens | Users |
|-----|---------|---------|-------|
| **NISO v2** | Core operations | Readings, SLA, Interruptions, Inspections | All roles |
| **NISO v3** | Notifications hub | Real-time alerts, acknowledgment | All roles |
| **Analytics Dashboard** | Trend analysis | SLA trends, equipment drill-down, KPIs | Supervisors+ |
| **Template Builder** | Equipment config | Template CRUD, versioning, field types | Admins |
| **v2 + Advanced Reporting** | Integrated dashboards | SLA trends + operations in one app | All roles |
| **Mobile for Field Ops** | iPhone/iPad app | Readings entry, alerts, status checks | Field operators |
| **Responsive Desktop** | Multi-device dashboard | Breaks: mobile → tablet → desktop | All roles |

### **Developer Handoff Package**

- **Backend Spec** — PostgreSQL schema, Node.js API endpoints, WebSocket events
- **Handoff Guide** — Project structure, integration patterns, testing checklist
- **Component Library** — ApiClient, OfflineStore, WebSocketManager, SLACalculator
- **Service Worker** — PWA offline support, background sync, push notifications
- **PWA Manifest** — Home screen installation, app shortcuts

---

## 🚀 Quick Start

### **For Design Review**
1. Open any HTML file in your browser
2. Interact with forms, navigation, role switching
3. Check mobile responsiveness (DevTools → iPhone 6 portrait / iPad landscape)
4. Review colors, typography, spacing, animations

### **For Development Handoff**
1. Read `NISO Backend Spec & Integration Guide.md` — Database design, API endpoints
2. Read `NISO Developer Handoff Package.md` — Project structure, integration patterns
3. Review `ComponentLibrary.js` — Reusable utilities for your app
4. Set up backend per the deployment checklist

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Frontend (7 React SPA Files)                    │
│ - v2 (Operations)   - Mobile (Field)   - Dashboards     │
│ - v3 (Alerts)       - Responsive       - Templates       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + WebSocket
         ┌─────────────┴────────────────┐
         ↓                              ↓
    ┌─────────────┐            ┌──────────────────┐
    │ Express API │            │ Socket.io Server │
    │ (Node.js)   │            │ (Real-time)      │
    │             │            │                  │
    │ - Auth      │────────────│ - Subscriptions  │
    │ - CRUD ops  │            │ - Broadcasts     │
    │ - Reports   │            │ - Heartbeat      │
    └──────┬──────┘            └──────┬───────────┘
           │                          │
           └──────────┬───────────────┘
                      ↓
         ┌──────────────────────┐
         │  PostgreSQL + Redis  │
         │  - Readings          │
         │  - SLA               │
         │  - Equipment         │
         │  - Audit logs        │
         │  - Cache layer       │
         └──────────────────────┘
```

---

## 📱 Device Support

### **Mobile (iPhone 6" portrait)**
- Bottom tab navigation (Status, Readings, Alerts, More)
- Touch-optimized buttons (48px minimum)
- Offline-first readings entry
- Real-time sync badge

### **Tablet (iPad 10" landscape)**
- Full sidebar visible
- 2-column layout
- Responsive charts
- Landscape forms

### **Desktop (1920x1080+)**
- Full 3-column KPI grid
- Equipment comparison tables
- Advanced drill-down
- Sidebars always visible

---

## 🔐 User Roles & Permissions

| Role | Station | Region | National | Edit | Approve | Seal |
|------|---------|--------|----------|------|---------|------|
| **Operator** | Own | — | — | Readings | — | — |
| **Supervisor** | Own | — | — | All | — | — |
| **Station Admin** | Own | — | — | Equipment | — | Yes |
| **Regional Admin** | All | Own | — | All | Alerts | Yes |
| **HQ Admin** | All | All | All | All | All | Yes |
| **Viewer** | Own | — | — | None | — | — |

---

## 💾 Data Model

### Core Entities
- **Users** — Email, role, station/region scope
- **Stations** — Physical locations, equipment groups
- **Equipment** — Turbines, condensers, etc. with templates
- **Readings** — Time-series operational data (AMP, MW, MVAR, KV)
- **SLA** — Actual vs forecast, variance tracking
- **Equipment Templates** — Reusable field schemas (6 types)
- **Alerts** — Critical notifications with thresholds
- **Audit Log** — Immutable action trail
- **Month Seals** — Data freeze for compliance

See `NISO Backend Spec & Integration Guide.md` for full schema.

---

## 🔌 API Integration

### Three-Step Setup

**Step 1: Install Client Library**
```html
<script src="/src/components/ComponentLibrary.js"></script>
```

**Step 2: Initialize Clients**
```javascript
const api = new ApiClient('https://api.niso.io', token);
const ws = new WebSocketManager('wss://api.niso.io', token);
const store = new OfflineStore('niso');

await store.init();
await ws.connect();
```

**Step 3: Use in Your App**
```javascript
// Save reading (works offline)
await api.post('/readings', { equipment_id: 1, data: {...} });

// Subscribe to real-time updates
ws.subscribe('equipment:1', (sla) => updateCard(sla));

// Sync when online
window.addEventListener('online', async () => {
  const result = await api.syncPending();
  console.log(`Synced ${result.synced} readings`);
});
```

Full examples in `NISO Developer Handoff Package.md`.

---

## 📊 Key Features

### **Operations (v2)**
- ✅ Equipment queue with sequential reads
- ✅ Operational codes for interruptions
- ✅ SLA tracking (actual vs forecast)
- ✅ Month sealing (data compliance)
- ✅ Audit logging (all actions tracked)

### **Notifications (v3)**
- ✅ Real-time alert feed
- ✅ Acknowledgment workflow
- ✅ Severity badges
- ✅ Auto-dismiss after 24h

### **Analytics**
- ✅ SLA trend charts (7/30/90 day ranges)
- ✅ Equipment drill-down (click row to expand)
- ✅ Threshold alerts (red/amber/green)
- ✅ Export (PDF/Excel/CSV)

### **Templates**
- ✅ 6 field types (text, number, dropdown, date, checkbox, formula)
- ✅ Validation (required, min/max, regex, custom formulas)
- ✅ Version history with rollback
- ✅ Clone & reuse across stations

### **Mobile**
- ✅ Offline-first readings entry
- ✅ Bottom tab navigation
- ✅ Touch-optimized forms
- ✅ Real-time sync status

### **PWA**
- ✅ Home screen installation
- ✅ Service worker (network-first API, cache-first assets)
- ✅ Background sync for offline readings
- ✅ Push notifications for critical alerts

---

## 🧪 Testing Checklist

### Unit Tests
```bash
npm test -- AuthService.test.js
npm test -- SLACalculator.test.js
npm test -- FormValidator.test.js
```

### Integration Tests
```bash
npm test -- api.integration.test.js
npm test -- websocket.integration.test.js
npm test -- offline-sync.integration.test.js
```

### E2E Tests (Playwright)
```bash
npx playwright test
# Scenarios:
# - Login → Dashboard → Equipment selection → Readings entry
# - Real-time SLA update (open on 2 tabs)
# - Offline → sync → online
# - Mobile responsive (6 breakpoints)
```

---

## 🚢 Deployment

### Development
```bash
npm install
npm run dev
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

### Staging
```bash
npm run build
npm run deploy:staging
# Review on staging environment
```

### Production
```bash
npm run deploy:prod
# Full rollout per phase plan in Handoff Package
```

See `NISO Backend Spec & Integration Guide.md` for cloud-specific guides (AWS, Heroku, DigitalOcean).

---

## 📈 Monitoring & Support

### Key Metrics
- API response time (target < 200ms)
- WebSocket latency (target < 100ms)
- Readings sync queue (alert if > 100 pending)
- Error rate (alert if > 1%)

### Support Levels
- **L1 Developer** — Local debugging, code issues
- **L2 DevOps** — Infrastructure, scaling, backups
- **L3 Architect** — Design decisions, performance tuning

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `NISO Backend Spec & Integration Guide.md` | Database schema, API endpoints, deployment |
| `NISO Developer Handoff Package.md` | Project structure, integration patterns, testing |
| `public/service-worker.js` | PWA offline support, background sync |
| `public/manifest.json` | PWA app metadata, shortcuts, icons |
| `src/components/ComponentLibrary.js` | Reusable utilities (ApiClient, OfflineStore, etc.) |
| This file | Quick reference guide |

---

## 🎯 Next Steps

### For Designers
1. Review all 7 HTML files
2. Provide feedback on layouts, colors, interactions
3. Request variations (dark mode, alternative layouts, etc.)

### For Developers
1. Read the Backend Spec
2. Read the Handoff Package
3. Set up local development environment
4. Begin Phase 1 (Database + API) from timeline

### For Product Managers
1. Review feature completeness
2. Prioritize additional features
3. Plan rollout strategy per phases

### For DevOps/Infrastructure
1. Review deployment architecture
2. Provision PostgreSQL + Redis
3. Set up CI/CD pipeline
4. Configure monitoring (Sentry, DataDog)

---

## 📞 Questions?

- **Technical** → See Handoff Package (Section 11: Support & Escalation)
- **Design** → Open issue with screenshot + description
- **Deployment** → See Backend Spec (Section 6: Deployment Checklist)
- **API Integration** → See ComponentLibrary.js examples

---

**NISO Platform v1.0** — Ready for production deployment.

Last updated: 2026-05-17
