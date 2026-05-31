const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorize } = require('./middleware/auth');
const { isConnected } = require('./db/connect');

const router = express.Router();

const nowIso = () => new Date().toISOString();
const todayIso = () => new Date().toISOString().split('T')[0];
const toId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const station = {
  id: 'station-jebba',
  name: 'Jebba TS',
  code: 'JEB',
  region: 'North Central',
  regionId: 'region-nc',
};

const equipmentCatalog = [
  { _id: 'eq-1', id: 'eq-1', name: '2JEB-SGB1', type: 'Generator Breaker' },
  { _id: 'eq-2', id: 'eq-2', name: '2JEB-TR1', type: 'Transformer' },
  { _id: 'eq-3', id: 'eq-3', name: '2JEB-LN132', type: '132kV Line' },
];

const accountSeeds = [
  ['HQ Admin', 'hq@niso.tcn.gov.ng', 'Admin@1234', 'HQ_ADMIN'],
  ['ICT Admin', 'ict@niso.tcn.gov.ng', 'Ict@1234', 'ICT_ADMIN'],
  ['Regional Admin', 'regional@niso.tcn.gov.ng', 'Region@1234', 'REGIONAL_ADMIN'],
  ['Station Admin', 'station-admin@niso.tcn.gov.ng', 'Station@1234', 'STATION_ADMIN'],
  ['Supervisor', 'supervisor@niso.tcn.gov.ng', 'Super@1234', 'SUPERVISOR'],
  ['Operator', 'operator@niso.tcn.gov.ng', 'Oper@1234', 'OPERATOR'],
  ['Knowledge Admin', 'knowledge@niso.tcn.gov.ng', 'Knowledge@1234', 'KNOWLEDGE_ADMIN'],
  ['Viewer', 'viewer@niso.tcn.gov.ng', 'View@1234', 'VIEWER'],
];

const users = accountSeeds.map(([label, email, password, role], index) => {
  const [firstName, lastName = 'User'] = label.split(' ');
  return {
    id: `user-${index + 1}`,
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    fullName: label,
    role,
    station: role === 'HQ_ADMIN' || role === 'ICT_ADMIN'
      ? { ...station }
      : { ...station },
    regionId: station.regionId,
  };
});

const findUserByToken = (req) => users.find((user) => user.id === req.user?.id) || null;
const equipmentById = (equipmentId) => equipmentCatalog.find((item) => item._id === equipmentId || item.id === equipmentId);

const state = {
  readings: [
    {
      _id: 'reading-1',
      id: 'reading-1',
      stationId: station.id,
      date: todayIso(),
      hour: 0,
      equipmentId: equipmentCatalog[0],
      mw: 152.5,
      mvar: 42.1,
      kv: 330.1,
      amperage: 450.2,
      temperature: 38.4,
      rawInput: null,
      valueType: 'number',
      status: 'sealed',
      sealedAt: nowIso(),
      remarks: 'Shift handover reading verified.',
    },
    {
      _id: 'reading-2',
      id: 'reading-2',
      stationId: station.id,
      date: todayIso(),
      hour: 1,
      equipmentId: equipmentCatalog[1],
      mw: 148.8,
      mvar: 40.9,
      kv: 329.8,
      amperage: 442.5,
      temperature: 39.1,
      rawInput: null,
      valueType: 'number',
      status: 'sealed',
      sealedAt: nowIso(),
      remarks: 'Within expected band.',
    },
    {
      _id: 'reading-3',
      id: 'reading-3',
      stationId: station.id,
      date: todayIso(),
      hour: 2,
      equipmentId: equipmentCatalog[2],
      mw: null,
      mvar: null,
      kv: null,
      amperage: null,
      temperature: null,
      rawInput: 'O/S',
      valueType: 'code',
      status: 'pending',
      sealedAt: null,
      remarks: 'Line isolated for planned maintenance.',
    },
  ],
  slaEntries: [
    {
      id: 'sla-1',
      stationId: station.id,
      date: todayIso(),
      hour: 8,
      feederId: 'JEB-FDR-01',
      forecastMw: 450,
      actualMw: 438,
      differenceMw: -12,
      remarks: 'Morning load below forecast.',
      approvedAt: nowIso(),
      approvedBy: 'user-5',
    },
    {
      id: 'sla-2',
      stationId: station.id,
      date: todayIso(),
      hour: 9,
      feederId: 'JEB-FDR-02',
      forecastMw: 465,
      actualMw: null,
      differenceMw: null,
      remarks: '',
      approvedAt: null,
      approvedBy: null,
    },
  ],
  interruptions: [
    {
      id: 'int-1',
      stationId: station.id,
      equipmentId: equipmentCatalog[2]._id,
      equipment: { name: equipmentCatalog[2].name },
      causeCode: 'MNT',
      causeName: 'Maintenance',
      tripDate: todayIso(),
      tripTime: '09:10',
      restorationTime: null,
      durationSeconds: 0,
      status: 'Active',
      notes: 'Crew on site for planned switching.',
    },
    {
      id: 'int-2',
      stationId: station.id,
      equipmentId: equipmentCatalog[0]._id,
      equipment: { name: equipmentCatalog[0].name },
      causeCode: 'FLT',
      causeName: 'Fault',
      tripDate: todayIso(),
      tripTime: '05:20',
      restorationTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      durationSeconds: 42 * 60,
      status: 'Resolved',
      notes: 'Cleared after breaker reset.',
    },
  ],
  inspections: [
    {
      id: 'insp-1',
      stationId: station.id,
      equipment: { name: equipmentCatalog[1].name },
      equipmentId: equipmentCatalog[1]._id,
      template: { name: 'Visual Inspection' },
      type: 'VIS',
      inspector: { fullName: 'Station Admin' },
      date: todayIso(),
      findings: 'Cooling fins clear. No leaks observed.',
      submittedAt: nowIso(),
      approvedAt: null,
      approvedBy: null,
    },
    {
      id: 'insp-2',
      stationId: station.id,
      equipment: { name: equipmentCatalog[0].name },
      equipmentId: equipmentCatalog[0]._id,
      template: { name: 'Thermal Imaging' },
      type: 'THM',
      inspector: { fullName: 'Supervisor' },
      date: todayIso(),
      findings: 'Hotspot not detected.',
      submittedAt: nowIso(),
      approvedAt: nowIso(),
      approvedBy: 'user-5',
    },
  ],
  reports: [
    {
      id: 'report-1',
      stationId: station.id,
      name: 'Daily Operations Summary',
      type: 'DAILY_OPS',
      frequency: 'DAILY',
      generatedAt: nowIso(),
      generatedBy: 'Station Admin',
      rowCount: 24,
    },
    {
      id: 'report-2',
      stationId: station.id,
      name: 'Monthly SLA Compliance',
      type: 'SLA_REPORT',
      frequency: 'MONTHLY',
      generatedAt: nowIso(),
      generatedBy: 'HQ Admin',
      rowCount: 48,
    },
  ],
  notifications: [
    {
      id: 'msg-1',
      stationId: station.id,
      type: 'BROADCAST',
      severity: 'warning',
      subject: 'Review pending SLA entries',
      content: 'Two hourly SLA entries still need actual values before supervisor sign-off.',
      fromName: 'Control Center',
      toName: 'All',
      sentAt: nowIso(),
      readAt: null,
    },
    {
      id: 'msg-2',
      stationId: station.id,
      type: 'DIRECT',
      severity: 'info',
      subject: 'Shift handover notes',
      content: 'Please verify line isolation tags before the 14:00 maintenance window.',
      fromName: 'Supervisor',
      toName: 'Operator',
      sentAt: nowIso(),
      readAt: nowIso(),
    },
  ],
  knowledge: [
    {
      id: 'article-1',
      title: 'Breaker Trip Response Procedure',
      category: 'Operations',
      summary: 'Immediate checks and restoration sequence for 132kV breaker trips.',
      body: '1. Confirm alarm source. 2. Verify protection relay indication. 3. Notify supervisor. 4. Isolate if unsafe. 5. Restore only after clearance.',
      version: 3,
      updatedAt: nowIso(),
      tags: ['breaker', 'protection', 'restoration'],
    },
    {
      id: 'article-2',
      title: 'SLA Variance Escalation Thresholds',
      category: 'Compliance',
      summary: 'Defines when SLA differences require remarks, review, or escalation.',
      body: 'Variance above 5 MW should be remarked. Variance above 50 MW requires supervisor review and a root-cause note.',
      version: 2,
      updatedAt: nowIso(),
      tags: ['sla', 'variance', 'compliance'],
    },
  ],
  approvals: [
    {
      id: 'approval-1',
      stationId: station.id,
      kind: 'inspection-signoff',
      title: 'Inspection sign-off - 2JEB-TR1',
      submittedBy: 'Station Admin',
      submittedAt: 'Today',
      equipment: '2JEB-TR1',
      after: { findings: 'Cooling fins clear. No leaks observed.' },
      notes: 'Awaiting supervisor confirmation.',
    },
  ],
  monthSeal: {},
};

const sendDemoHeader = (res) => {
  res.setHeader('X-NISO-Mode', 'demo-fallback');
};

const buildToken = (user) => jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
    stationId: user.station?.id || null,
    regionId: user.regionId || null,
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);

router.use((req, res, next) => {
  sendDemoHeader(res);
  next();
});

router.post('/auth/login', (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const password = String(req.body?.password || '');
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    token: buildToken(user),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      station: user.station,
      regionId: user.regionId,
    },
  });
});

router.post('/auth/register', (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ error: 'email is required' });
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();
  const role = String(req.body?.role || 'VIEWER').trim();
  const user = {
    id: toId('user'),
    email,
    password: String(req.body?.password || 'ChangeMe123!'),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    role,
    station: { ...station },
    regionId: station.regionId,
  };
  users.push(user);
  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    message: 'User created successfully',
  });
});

router.get('/users/me', authenticateToken, (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    role: user.role,
    station: user.station,
    regionId: user.regionId,
  });
});

router.get('/equipment', authenticateToken, (_req, res) => {
  res.json(equipmentCatalog);
});

router.get('/readings', authenticateToken, (req, res) => {
  const { stationId, date } = req.query;
  let rows = [...state.readings];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  if (date) rows = rows.filter((item) => item.date === date);
  rows.sort((a, b) => a.hour - b.hour);
  res.json(rows);
});

router.post('/readings', authenticateToken, (req, res) => {
  const equipment = equipmentById(req.body?.equipmentId) || equipmentCatalog[0];
  const record = {
    _id: toId('reading'),
    id: toId('reading'),
    stationId: req.body?.stationId || station.id,
    date: req.body?.date || todayIso(),
    hour: Number(req.body?.hour ?? 0),
    equipmentId: equipment,
    mw: req.body?.mw ?? null,
    mvar: req.body?.mvar ?? null,
    kv: req.body?.kv ?? null,
    amperage: req.body?.amperage ?? null,
    temperature: req.body?.temperature ?? null,
    rawInput: req.body?.rawInput ?? null,
    valueType: req.body?.valueType || (req.body?.rawInput ? 'code' : 'number'),
    status: 'pending',
    sealedAt: null,
    remarks: req.body?.remarks ?? null,
  };
  record.id = record._id;
  state.readings.push(record);
  res.status(201).json(record);
});

router.patch('/readings/:id', authenticateToken, (req, res) => {
  const record = state.readings.find((item) => item._id === req.params.id || item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Reading not found' });
  Object.assign(record, req.body || {});
  res.json(record);
});

router.post('/readings/:id/seal', authenticateToken, authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN'), (req, res) => {
  const record = state.readings.find((item) => item._id === req.params.id || item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Reading not found' });
  record.status = 'sealed';
  record.sealedAt = nowIso();
  res.json(record);
});

router.get('/sla', authenticateToken, (req, res) => {
  const { stationId, date } = req.query;
  let rows = [...state.slaEntries];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  if (date) rows = rows.filter((item) => item.date === date);
  rows.sort((a, b) => a.hour - b.hour);
  res.json(rows);
});

router.post('/sla', authenticateToken, (req, res) => {
  const forecastMw = req.body?.forecastMw ?? 450;
  const actualMw = req.body?.actualMw ?? null;
  const record = {
    id: toId('sla'),
    stationId: req.body?.stationId || station.id,
    date: req.body?.date || todayIso(),
    hour: Number(req.body?.hour ?? 0),
    feederId: req.body?.feederId || 'JEB-FDR-NEW',
    forecastMw: Number(forecastMw),
    actualMw: actualMw == null ? null : Number(actualMw),
    differenceMw: actualMw == null ? null : Number(actualMw) - Number(forecastMw),
    remarks: req.body?.remarks || '',
    approvedAt: null,
    approvedBy: null,
  };
  state.slaEntries.push(record);
  res.status(201).json(record);
});

router.patch('/sla/:id', authenticateToken, (req, res) => {
  const record = state.slaEntries.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'SLA entry not found' });
  Object.assign(record, req.body || {});
  if (record.actualMw != null) {
    record.differenceMw = Number(record.actualMw) - Number(record.forecastMw);
  }
  res.json(record);
});

router.post('/sla/:id/approve', authenticateToken, authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'), (req, res) => {
  const record = state.slaEntries.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'SLA entry not found' });
  record.approvedAt = nowIso();
  record.approvedBy = req.user.id;
  res.json(record);
});

router.get('/interruptions', authenticateToken, (req, res) => {
  const { stationId, status } = req.query;
  let rows = [...state.interruptions];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  if (status && status !== 'All') {
    rows = rows.filter((item) => item.status === status);
  }
  res.json(rows);
});

router.post('/interruptions', authenticateToken, (req, res) => {
  const equipment = equipmentById(req.body?.equipmentId);
  const record = {
    id: toId('int'),
    stationId: req.body?.stationId || station.id,
    equipmentId: req.body?.equipmentId || equipmentCatalog[0]._id,
    equipment: { name: equipment?.name || req.body?.equipmentId || 'Unknown Equipment' },
    causeCode: req.body?.causeCode || 'OTH',
    causeName: req.body?.causeName || 'Other',
    tripDate: req.body?.tripDate || todayIso(),
    tripTime: req.body?.tripTime || '00:00',
    restorationTime: null,
    durationSeconds: 0,
    status: req.body?.status || 'Active',
    notes: req.body?.notes || '',
  };
  state.interruptions.unshift(record);
  res.status(201).json(record);
});

router.patch('/interruptions/:id', authenticateToken, (req, res) => {
  const record = state.interruptions.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Interruption not found' });
  Object.assign(record, req.body || {});
  res.json(record);
});

router.post('/interruptions/:id/restore', authenticateToken, (req, res) => {
  const record = state.interruptions.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Interruption not found' });
  const restorationTime = req.body?.restorationTime || nowIso();
  record.restorationTime = restorationTime;
  record.restoreDate = req.body?.restoreDate || restorationTime.split('T')[0];
  record.restoreTime = req.body?.restoreTime || restorationTime.slice(11, 16);
  record.status = 'Resolved';
  if (record.tripDate && record.tripTime) {
    const tripAt = new Date(`${record.tripDate}T${record.tripTime}:00`);
    record.durationSeconds = Math.max(0, Math.round((new Date(restorationTime).getTime() - tripAt.getTime()) / 1000));
  }
  if (req.body?.notes) record.notes = req.body.notes;
  res.json(record);
});

router.get('/inspections', authenticateToken, (req, res) => {
  const { stationId } = req.query;
  let rows = [...state.inspections];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  res.json(rows);
});

router.post('/inspections', authenticateToken, (req, res) => {
  const equipment = equipmentById(req.body?.equipmentId);
  const record = {
    id: toId('insp'),
    stationId: req.body?.stationId || station.id,
    equipment: { name: equipment?.name || req.body?.equipmentId || 'Unknown Equipment' },
    equipmentId: req.body?.equipmentId || equipmentCatalog[0]._id,
    template: { name: req.body?.typeName || req.body?.type || 'Inspection' },
    type: req.body?.type || 'VIS',
    inspector: { fullName: req.body?.inspector || 'Operator' },
    date: req.body?.date || todayIso(),
    findings: req.body?.findings || '',
    submittedAt: nowIso(),
    approvedAt: null,
    approvedBy: null,
  };
  state.inspections.unshift(record);
  res.status(201).json(record);
});

router.patch('/inspections/:id', authenticateToken, (req, res) => {
  const record = state.inspections.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Inspection not found' });
  Object.assign(record, req.body || {});
  res.json(record);
});

router.post('/inspections/:id/approve', authenticateToken, authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'), (req, res) => {
  const record = state.inspections.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Inspection not found' });
  record.approvedAt = nowIso();
  record.approvedBy = req.user.id;
  res.json(record);
});

router.get('/reports/summary', authenticateToken, (req, res) => {
  const { stationId } = req.query;
  let rows = [...state.reports];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  res.json(rows);
});

router.post('/reports', authenticateToken, (req, res) => {
  const creator = findUserByToken(req);
  const record = {
    id: toId('report'),
    stationId: req.body?.stationId || station.id,
    name: req.body?.name || 'Generated report',
    type: req.body?.type || 'CUSTOM',
    frequency: req.body?.frequency || 'CUSTOM',
    generatedAt: nowIso(),
    generatedBy: creator?.fullName || req.user.email,
    rowCount: state.readings.length + state.slaEntries.length + state.interruptions.length,
  };
  state.reports.unshift(record);
  res.status(201).json(record);
});

router.post('/reports/export/pdf', authenticateToken, (req, res) => {
  res.json({
    ok: true,
    format: 'pdf',
    reportId: req.body?.reportId || null,
    message: 'Demo export completed. Wire a live database to generate production files.',
  });
});

router.post('/reports/export/excel', authenticateToken, (req, res) => {
  res.json({
    ok: true,
    format: req.body?.format || 'xlsx',
    reportId: req.body?.reportId || null,
    message: 'Demo export completed. Wire a live database to generate production files.',
  });
});

router.get('/notifications', authenticateToken, (req, res) => {
  const { stationId } = req.query;
  let rows = [...state.notifications];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  res.json(rows);
});

router.post('/notifications', authenticateToken, (req, res) => {
  const record = {
    id: toId('msg'),
    stationId: req.body?.stationId || station.id,
    type: req.body?.type || 'BROADCAST',
    severity: req.body?.severity || 'info',
    subject: req.body?.subject || '(no subject)',
    content: req.body?.content || '',
    fromName: req.body?.fromName || req.user.email,
    toName: req.body?.type === 'DIRECT' ? req.body?.toUserId || 'Recipient' : 'All',
    sentAt: nowIso(),
    readAt: null,
  };
  state.notifications.unshift(record);
  res.status(201).json(record);
});

router.patch('/notifications/:id/read', authenticateToken, (req, res) => {
  const record = state.notifications.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Notification not found' });
  record.readAt = nowIso();
  res.json(record);
});

router.get('/knowledge', authenticateToken, (req, res) => {
  const category = String(req.query.category || '').trim();
  const rows = category ? state.knowledge.filter((item) => item.category === category) : state.knowledge;
  res.json(rows);
});

router.get('/knowledge/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const rows = !q
    ? []
    : state.knowledge.filter((item) =>
      [item.title, item.summary, item.body, item.category, ...(item.tags || [])]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(q))
    );
  res.json(rows);
});

router.post('/knowledge/ask', authenticateToken, (req, res) => {
  const question = String(req.body?.question || '').trim();
  if (!question) return res.status(400).json({ error: 'question is required' });

  let answer = 'No direct article match yet. Check the operations and compliance guides in Knowledge Center.';
  if (/sla|variance|forecast|actual/i.test(question)) {
    answer = 'In demo mode, SLA variance above 5 MW should include remarks, and variance above 50 MW should be escalated for supervisor review.';
  } else if (/breaker|trip|interruption|restore/i.test(question)) {
    answer = 'For a breaker trip, confirm relay indication, notify the supervisor, isolate if unsafe, and restore only after clearance from operations.';
  } else if (/inspection|maintenance|thermal/i.test(question)) {
    answer = 'Capture the inspection type, equipment, inspector, and findings, then submit for supervisor approval before close-out.';
  }

  res.json({ answer, mode: 'demo-fallback' });
});

router.get('/approvals', authenticateToken, (req, res) => {
  const { stationId } = req.query;
  let rows = [...state.approvals];
  if (stationId) rows = rows.filter((item) => item.stationId === stationId);
  res.json(rows);
});

router.post('/approvals/:id/approve', authenticateToken, authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'), (req, res) => {
  res.json({
    id: req.params.id,
    status: 'approved',
    approvedAt: nowIso(),
    approvedBy: req.user.id,
    comment: req.body?.comment || null,
  });
});

router.post('/approvals/:id/reject', authenticateToken, authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'), (req, res) => {
  const comment = String(req.body?.comment || '').trim();
  if (!comment) return res.status(400).json({ error: 'Reject requires a comment' });
  res.json({
    id: req.params.id,
    status: 'rejected',
    rejectedAt: nowIso(),
    rejectedBy: req.user.id,
    comment,
  });
});

router.get('/month/seal', authenticateToken, (req, res) => {
  const stationId = String(req.query.stationId || '');
  const year = Number(req.query.year || 0);
  const month = Number(req.query.month || 0);
  if (!stationId || !year || !month) {
    return res.status(400).json({ error: 'stationId, year, and month are required' });
  }
  const key = `${stationId}-${year}-${month}`;
  const record = state.monthSeal[key] || {
    state: 'OPEN',
    transitionedAt: null,
    transitionedBy: null,
    readingsSealed: 0,
    slaApproved: 0,
  };
  res.json({ stationId, year, month, ...record });
});

router.post('/month/seal', authenticateToken, authorize('STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'), (req, res) => {
  const stationId = String(req.body?.stationId || '');
  const year = Number(req.body?.year || 0);
  const month = Number(req.body?.month || 0);
  const transition = String(req.body?.transition || '');
  if (!stationId || !year || !month || !transition) {
    return res.status(400).json({ error: 'stationId, year, month, transition are required' });
  }

  const key = `${stationId}-${year}-${month}`;
  const current = state.monthSeal[key] || { state: 'OPEN' };
  const order = ['OPEN', 'REVIEW', 'SEALED'];
  if (order.indexOf(transition) !== order.indexOf(current.state) + 1) {
    return res.status(409).json({
      error: `Cannot transition from ${current.state} to ${transition}`,
      code: 'INVALID_TRANSITION',
    });
  }

  const next = {
    state: transition,
    transitionedAt: nowIso(),
    transitionedBy: req.user.id,
    readingsSealed: current.readingsSealed || 0,
    slaApproved: current.slaApproved || 0,
  };

  if (transition === 'SEALED') {
    const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;
    next.readingsSealed = 0;
    next.slaApproved = 0;
    state.readings.forEach((item) => {
      if (item.stationId === stationId && String(item.date || '').startsWith(targetPrefix) && !item.sealedAt) {
        item.status = 'sealed';
        item.sealedAt = nowIso();
        next.readingsSealed += 1;
      }
    });
    state.slaEntries.forEach((item) => {
      if (item.stationId === stationId && String(item.date || '').startsWith(targetPrefix) && !item.approvedAt) {
        item.approvedAt = nowIso();
        item.approvedBy = req.user.id;
        next.slaApproved += 1;
      }
    });
  }

  state.monthSeal[key] = next;
  res.json({ stationId, year, month, ...next });
});

const isDemoFallbackEnabled = () =>
  process.env.NODE_ENV !== 'production' &&
  process.env.ENABLE_LOCAL_DEMO_FALLBACK !== 'false' &&
  !isConnected();

const demoApi = (req, res, next) => {
  if (!isDemoFallbackEnabled()) return next();
  return router(req, res, next);
};

module.exports = {
  demoApi,
  isDemoFallbackEnabled,
};
