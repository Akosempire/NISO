# NISO: Known Architectural Decisions

## Design & UI

### 1. No Gradients
**Decision:** Flat institutional UI only.  
**Rationale:** TCN is an operational utility, not a fintech startup. Flat design conveys professionalism and seriousness. Gradients distract from data clarity.

### 2. Desktop-First, Responsive
**Decision:** Design for desktop (1920px) first; responsive breakpoints second.  
**Rationale:** Operators are in shift environments with large monitors. Mobile is future.

### 3. Monospace Font for Operational Values
**Decision:** All numeric readings use monospace (Courier New).  
**Rationale:** Operators scan numbers quickly. Monospace alignment aids visual parsing of readings.

### 4. Light Professional Color Palette
**Decision:** Neutral grays (#f9f–#111827), blue accent (#2563eb).  
**Rationale:** High contrast, accessibility, professional appearance. TCN brand color to override accent (pending confirmation).

### 5. Side-Drawer for Input (Not Modal)
**Decision:** Input forms (readings, SLA, interruptions, inspections) open in a right-side drawer, not a modal.  
**Rationale:** Drawer doesn't block the table behind it (context remains visible). Fast keyboard workflow (Tab, Enter, next item). Operator can reference adjacent equipment while inputting.

---

## Data Architecture

### 6. One Source of Truth
**Decision:** Single `readings` table powers all reports, views, exports.  
**Rationale:** Eliminates data duplication. Any change in readings cascades to all reports. "ENTER ONCE → REUSE EVERYWHERE."

### 7. Raw + Numeric Storage
**Decision:** Store both `raw_input` (as entered) and `numeric_value` (parsed).  
**Rationale:** Audit trail preserved. If operator enters "O/S" (Out of Service), we store the text AND parse it as a code. Hybrid input model supported.

### 8. Immutable Sealed Records
**Decision:** Sealed months cannot be edited at raw record level (`sealed_at` prevents UPDATE). Formulas can still be re-analyzed.  
**Rationale:** Audit compliance. Historical data immutable. But operational staff can re-run formulas to recalculate derived values.

### 9. Formula Versioning
**Decision:** Every formula change is versioned. Old formulas persist. Historical data can be re-analyzed with old/new formulas.  
**Rationale:** "What if we change the SLA formula?" Operators can compare old vs. new calculations. No historical data is lost.

### 10. Template-Driven, Not Hardcoded
**Decision:** Field definitions, templates, formulas are all in the database. None are hardcoded in app logic.  
**Rationale:** Operational staff can adapt without code changes. 330kV template can differ from 132kV template. Admins add custom templates without developer intervention.

---

## Permissions & Security

### 11. Backend-Enforced Permissions (Not Frontend)
**Decision:** All access control is enforced at API layer. Frontend doesn't decide what user can do.  
**Rationale:** Frontend can be bypassed. Backend is the source of truth. Every API call checks user role + scope (region, station, equipment).

### 12. Strict Isolation: Region, Station, Equipment
**Decision:** Regional Admin sees only their region. Station Admin sees only their station. No cross-station visibility unless explicitly granted.  
**Rationale:** Data security. Stations under same region MUST NOT see each other's data by default. Query layer filters: `WHERE region_id = ? AND station_id = ?`

### 13. Role-Based Sidebar (Dynamic)
**Decision:** Sidebar modules are dynamically generated from backend permissions. Unauthorized modules never render.  
**Rationale:** No "dead buttons." User only sees what they're authorized to use.

### 14. No Role Mixing
**Decision:** One user, one role per session. Not: "Admin AND Operator."  
**Rationale:** Clarity. Role switcher (for testing) regenerates sidebar. Production: users have one role per organization context.

---

## Operational Workflows

### 15. Hourly Readings: Queue Workflow
**Decision:** Operator doesn't see a grid of 24 hours × 100 equipment cells. Instead: select hour → view equipment queue → open one drawer at a time → Save & Next.  
**Rationale:** Reduces cognitive load. Forces sequential entry. Prevents skipping. Faster keyboard workflow.

### 16. SLA: Read-Only Forecast
**Decision:** Operator cannot edit forecast. Forecast comes from Regional Admin / NCC.  
**Rationale:** Forecast is policy, not operator decision. Operator inputs actual MW + meter reading. Difference is auto-calculated and flagged for review.

### 17. Interruptions: Multi-Equipment Support
**Decision:** One interruption session can record multiple equipment faults (multi-select).  
**Rationale:** Real-world: a relay fault trips 3 feeders at once. One session, many equipment records.

### 18. Inspections: Session-Based Audit Trail
**Decision:** Each inspection is an immutable session (cannot edit after approval).  
**Rationale:** Compliance. Inspection records are legal documents. Once signed off by supervisor, they're locked.

### 19. Month Sealing: Explicit Action
**Decision:** Months don't auto-seal. Regional Admin / Supervisor explicitly transitions month (Open → Review → Sealed).  
**Rationale:** Operational control. Ensures all data is reviewed before locking.

---

## API & Data Flow

### 20. No Real-Time Sync (Yet)
**Decision:** MVP is stateless. No websockets. No live collaboration on same reading.  
**Rationale:** Simplicity. Phase 2 can add real-time sync (operator A fills reading, operator B sees it appear).

### 21. Optimistic UI Updates
**Decision:** UI updates immediately on user action. If API fails, rollback.  
**Rationale:** Responsiveness. Operator doesn't wait for server to save.

### 22. Audit Logging Async (Future)
**Decision:** Log writes can be async (fire-and-forget). Don't block user action.  
**Rationale:** Audit logging shouldn't slow down operations. Use queue (Bull, RabbitMQ) in Phase 2.

---

## Coding Standards

### 23. Service + Repository Layers
**Decision:** Business logic (services) separated from data access (repositories).  
**Rationale:** Testability. Reusability. Repository can swap PostgreSQL → MongoDB without changing service.

### 24. Strict TypeScript
**Decision:** All backend code is TypeScript. Types enforced at compile time.  
**Rationale:** Operational software is safety-critical. Types prevent class of bugs.

### 25. Zod Validation (Frontend + Backend)
**Decision:** All form inputs validated with Zod schema (frontend + backend).  
**Rationale:** Defense in depth. Frontend UX validation. Backend security validation. Schema is single source of truth.

### 26. No ORM Magic
**Decision:** Prisma ORM used explicitly (not auto-generating migrations or queries).  
**Rationale:** Operational code must be auditable. Explicit migrations → version control. No hidden queries.

---

## Scale & Performance

### 27. Query Indexing
**Decision:** Index on: `equipment_id`, `date`, `hour`, `station_id`, `created_by`, `sealed_at`.  
**Rationale:** Most queries filter by these. Indexes speed up common operations (daily readings, monthly reports).

### 28. Pagination (Future)
**Decision:** MVP doesn't paginate. Phase 2: add pagination to large tables (years of historical data).  
**Rationale:** MVP scope is small. TCN stations don't have massive tables yet. Pagination added when needed.

### 29. Caching (Future)
**Decision:** MVP has no caching. Phase 2: Redis for report generation, frequently accessed master data (equipment, parameters).  
**Rationale:** Simplicity. Reports are on-demand, not real-time. Caching complexity justified only at scale.

---

## Integration & Extensibility

### 30. SCADA-Ready (Pluggable)
**Decision:** `reading.source` field tracks `'manual'` vs `'scada'`. Equipment has optional `scada_tag` field.  
**Rationale:** Future SCADA integration doesn't require schema redesign. Just fill in `scada_tag`, add ingestion service.

### 31. Notification Pluggable
**Decision:** Notifications table + provider interface. Email/SMS/WhatsApp are implementations, not hard requirements.  
**Rationale:** Switching providers doesn't require code changes. Admin configures notification routing.

### 32. Knowledge RAG-Pluggable
**Decision:** Vector embeddings are abstract. Can use OpenAI, Cohere, Anthropic, or local model.  
**Rationale:** No lock-in. Cost/performance tradeoff decided by operator.

---

## Change Management

### 33. Database Migrations Versioned
**Decision:** Every schema change is a numbered migration. Applied in order.  
**Rationale:** Audit trail of schema evolution. Rollback possible (with caveats). Reproducible across environments.

### 34. Formula Versioning Explicit
**Decision:** When formula changes, new version created. Old version stays. Activation timestamp recorded.  
**Rationale:** Operators can compare "what if we used the old formula?" Historical data preserved.

### 35. No Silent Data Transformations
**Decision:** When operational logic changes (e.g., SLA threshold), it's logged and explicit. Not hidden in code.  
**Rationale:** Compliance. Auditors must see when operational rules changed.

---

## Testing & Validation

### 36. Unit Tests on Service Layer
**Decision:** Core business logic (formula evaluation, SLA calculation, interruption duration) is tested.  
**Rationale:** Operational correctness is critical. Unit tests prevent regressions.

### 37. Integration Tests on API Layer
**Decision:** End-to-end tests verify permission enforcement, data flow, role isolation.  
**Rationale:** Security-critical. Tests ensure backend actually enforces rules.

### 38. No E2E GUI Tests (Yet)
**Decision:** MVP doesn't have Cypress/Playwright tests. Phase 2: add if UI becomes complex.  
**Rationale:** GUI tests are fragile. MVP has simple workflows. Manual testing sufficient.

---

## Error Handling

### 39. Fail Open (with Logging)
**Decision:** If audit logging fails, operation continues. Error is logged separately.  
**Rationale:** User action (e.g., save reading) shouldn't block on audit system. Audit failure is monitored, not user-blocking.

### 40. Validation Errors Clear
**Decision:** All form validation errors are specific (not "invalid input"). Tell operator exactly what's wrong.  
**Rationale:** Operators are not developers. "MW must be > 0" is helpful. "Invalid field" is not.

---

## Documentation

### 41. Code Comments on Why, Not What
**Decision:** Comments explain business logic ("SLA difference > 5MW = alert"), not code mechanics ("add x to y").  
**Rationale:** Code is self-documenting. Comments explain *why* a rule exists (operational policy).

### 42. Internal Docs for Future Devs
**Decision:** SYSTEM_CONTEXT.md, BUILD_LOG.md, MODULES_OVERVIEW.md explain architecture for next developer or AI.  
**Rationale:** Operational software must be maintainable long-term. Docs preserve institutional knowledge.

---

**Last Updated:** May 8, 2026  
**Audience:** Developers, maintenance staff, future team members, AI systems
