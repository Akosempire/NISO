# NISO Quick Start Guide

## For Product Managers

**NISO solves**:
- ❌ Operators manually entering readings into 3+ systems → ✅ Single input, auto-syncs everywhere
- ❌ SLA calculations done in Excel by hand → ✅ Formula-driven, versioned, audited
- ❌ Interruptions tracked on WhatsApp/paper → ✅ Timestamp-locked incident log
- ❌ No visibility into field operations → ✅ Real-time multi-station dashboards
- ❌ Impossible to audit who changed what → ✅ Complete immutable audit trail

**What's built** (MVP Phase 1):
- ✅ Hourly readings input + sealing
- ✅ SLA tracking (forecast vs actual)
- ✅ Interruption logging (trip/restoration)
- ✅ Inspection checklists
- ✅ Multi-station dashboard
- ✅ Excel/PDF exports
- ✅ Role-based access (6 roles)
- ✅ Offline input + sync
- ✅ Complete audit logging

**Next priorities**:
1. **SCADA integration** → Auto-populate readings from live meter data
2. **Notification system** → Email/SMS alerts for critical events
3. **Mobile app** → Operators on field don't need laptop
4. **Advanced reporting** → Drag-and-drop custom reports
5. **Template builder** → Admins design forms without code

---

## For Engineers

### Architecture

```
React (frontend) ←→ Express.js (backend) ←→ PostgreSQL + Redis
```

- **Frontend**: React + TypeScript, offline-first, mobile-responsive
- **Backend**: Node.js + Express, JWT auth, role-based middleware
- **Database**: PostgreSQL (read/write), Redis (cache), S3 (uploads)
- **Deployment**: Docker + AWS ECS (backend), Vercel (frontend)

### Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (User, Station, Reading, SLAEntry, etc.) |
| `src/services/reading.service.ts` | Read/write logic for hourly readings |
| `src/services/formula.service.ts` | Formula evaluation engine |
| `src/middleware/rbac.ts` | Role-based access control checks |
| `src/routes/readings.routes.ts` | REST endpoints for readings |
| `frontend/src/hooks/useReadings.ts` | React hook for reading queries |
| `frontend/src/components/ReadingForm.tsx` | Input form component |

### Getting Started

```bash
# 1. Clone repo
git clone https://github.com/tcn/niso.git && cd niso

# 2. Install dependencies
npm install && npm install --prefix backend

# 3. Setup local database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:14
sleep 5
cd backend && npx prisma db push

# 4. Start services
npm run dev                      # Terminal 1: Frontend
npm run dev --prefix backend     # Terminal 2: Backend
```

Then:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API docs: http://localhost:3001/api-docs (Swagger)

### Testing

```bash
npm run test                     # Unit tests
npm run test:integration         # Integration tests (uses test DB)
npm run test:e2e                 # End-to-end tests (full app)
npm run lint                     # Code style
npm run build                    # Production build
```

### Common Tasks

```bash
# Add new field to Reading
# 1. Edit: prisma/schema.prisma
# 2. Generate migration: npx prisma migrate dev --name add_field_name
# 3. Update Reading.service.ts to handle new field
# 4. Update frontend form component
# 5. Run tests & deploy

# Create new API endpoint
# 1. Create route: src/routes/myfeature.routes.ts
# 2. Import in src/index.ts: app.use('/api/myfeature', myfeatureRoutes)
# 3. Write tests in tests/myfeature.test.ts
# 4. Document in API_SPEC.md

# Deploy to staging
# 1. Push to GitHub
# 2. CI/CD runs tests automatically
# 3. Merge to staging branch
# 4. GitHub Actions deploys to staging env
# 5. Test in staging, merge to main
# 6. Automatic deploy to production
```

### Debugging

```typescript
// Backend: Add logging
logger.info('Reading created', { userId, readingId, equipmentId });

// Frontend: React DevTools
// Install: https://react-devtools-tutorial.vercel.app/
// Check component state, props, performance

// Database queries
npx prisma studio  # Visual database explorer
# Or SQL: SELECT * FROM "Reading" WHERE "sealedAt" IS NULL;

// Network requests
// Open browser DevTools → Network tab
// Check API response status, payload, timing
```

---

## For Operators

### Entering Readings

1. **Log in** with email + password
2. **Navigate** to Readings → Select your station
3. **Fill form** (values auto-populate from templates)
4. **Submit** (saved to server or offline queue)
5. **Wait for approval** from Station Admin

### Viewing Status

- **Dashboard** shows all your readings for today
- **Green** = Sealed (complete)
- **Yellow** = Pending approval
- **Red** = Missing/error

### Offline Usage

- If no internet, readings save locally
- When connected again, sync automatically
- No need to re-enter

### Troubleshooting

- **"Value out of range"**: Check equipment type, field limits
- **"Duplicate entry"**: That hour/equipment already has a reading
- **"Form won't submit"**: Check required fields (marked with *)

---

## For Station Admins

### Daily Tasks

1. **Review submissions** → Readings → Pending
2. **Validate** readings against SCADA/manual checks
3. **Approve or reject** each reading
4. **Seal** approved readings (becomes immutable)

### SLA Tracking

1. **Forecast MW** (provided by load dispatch)
2. **Actual MW** (from generator/meter)
3. System auto-calculates **Difference**
4. If |Difference| > 50 MW, HQ gets alert

### Interruptions

1. **Log trip**: Equipment ID, trip time, cause code
2. **Log restoration**: Restoration time (auto-calc duration)
3. **Add notes** (optional context)
4. Mark **Resolved** when investigated

### Reports

- **Daily**: Readings sealed today, any errors
- **Weekly**: SLA performance, interruption count
- **Export**: Excel for email to region/HQ

---

## For Regional Admins

### Visibility

- See all stations in your region (real-time dashboard)
- Drill down into any station for details
- Search/filter by date, equipment type, status

### Approvals

- Approve SLA entries from multiple stations
- Escalate exceptions (large forecast-actual gaps)
- Sign-off on inspections

### Reporting

- View region-level summaries
- Compare stations (which has highest uptime?)
- Export regional reports

---

## For HQ Admins

### National Visibility

- **Map view**: All regions, stations, status indicators
- **Metrics**: Total MW generated, system reliability, interruption rate
- **Alerts**: Critical issues (unresolved interruptions >2hrs, SLA deviation >100MW)

### Approvals & Oversight

- Final sign-off on critical readings
- Review region-level summaries
- Investigate exceptions

### User Management

- Create/deactivate users
- Assign roles and stations
- Reset passwords

### Audit & Compliance

- Query audit logs by date/user/action
- Export for regulatory reports
- Ensure 7-year data retention

---

## FAQ

**Q: Can operators edit readings after sealing?**  
A: No. Sealed = immutable. They must contact admin to create correction entry.

**Q: What if internet goes down mid-entry?**  
A: Readings saved locally in browser. Resume when online. System syncs automatically.

**Q: Can I use NISO on my phone?**  
A: Yes, web app is mobile-responsive. Full app (iOS/Android native) coming Phase 2.

**Q: Who can export data?**  
A: Station Admin+ (not Operators). Exports logged in audit trail.

**Q: How long is data kept?**  
A: 7 years minimum (configurable). Sealed readings immutable for life.

**Q: Can I undo an approval?**  
A: No. Document approval as immutable. Create new corrected entry if needed.

---

## Resources

- **API Documentation**: `API_SPEC.md`
- **Backend Implementation**: `BACKEND_IMPLEMENTATION.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION.md`
- **Deployment Guide**: `DEPLOYMENT_OPERATIONS.md`
- **System Architecture**: `SYSTEM_CONTEXT.md` (this file)

---

**Support**: Reach out to engineering team or check GitHub issues/discussions.
