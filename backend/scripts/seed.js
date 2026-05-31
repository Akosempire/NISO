/**
 * MongoDB seed — creates a demo account for every role plus one station and equipment.
 * Run: node scripts/seed.js
 *
 * Demo credentials (all use the same password format for easy memorisation):
 *   hq@niso.tcn.gov.ng           Admin@1234   HQ_ADMIN
 *   ict@niso.tcn.gov.ng          Ict@1234     ICT_ADMIN
 *   regional@niso.tcn.gov.ng     Region@1234  REGIONAL_ADMIN
 *   station-admin@niso.tcn.gov.ng Station@1234 STATION_ADMIN
 *   supervisor@niso.tcn.gov.ng   Super@1234   SUPERVISOR
 *   operator@niso.tcn.gov.ng     Oper@1234    OPERATOR
 *   knowledge@niso.tcn.gov.ng    Knowledge@1234 KNOWLEDGE_ADMIN
 *   viewer@niso.tcn.gov.ng       View@1234    VIEWER
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const DEMO_USERS = [
  { email: 'hq@niso.tcn.gov.ng',            password: 'Admin@1234',     firstName: 'HQ',          lastName: 'Administrator', role: 'HQ_ADMIN',        scoped: 'none'    },
  { email: 'ict@niso.tcn.gov.ng',           password: 'Ict@1234',       firstName: 'ICT',         lastName: 'Administrator', role: 'ICT_ADMIN',       scoped: 'none'    },
  { email: 'regional@niso.tcn.gov.ng',      password: 'Region@1234',    firstName: 'Regional',    lastName: 'Administrator', role: 'REGIONAL_ADMIN',  scoped: 'region'  },
  { email: 'station-admin@niso.tcn.gov.ng', password: 'Station@1234',   firstName: 'Station',     lastName: 'Administrator', role: 'STATION_ADMIN',   scoped: 'station' },
  { email: 'supervisor@niso.tcn.gov.ng',    password: 'Super@1234',     firstName: 'Station',     lastName: 'Supervisor',    role: 'SUPERVISOR',      scoped: 'station' },
  { email: 'operator@niso.tcn.gov.ng',      password: 'Oper@1234',      firstName: 'Field',       lastName: 'Operator',      role: 'OPERATOR',        scoped: 'station' },
  { email: 'knowledge@niso.tcn.gov.ng',     password: 'Knowledge@1234', firstName: 'Knowledge',   lastName: 'Administrator', role: 'KNOWLEDGE_ADMIN', scoped: 'none'    },
  { email: 'viewer@niso.tcn.gov.ng',        password: 'View@1234',      firstName: 'Read-only',   lastName: 'Viewer',        role: 'VIEWER',          scoped: 'station' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'niso_db' });
  console.log('Connected to MongoDB');

  const User      = require('../src/models/User');
  const Station   = require('../src/models/Station');
  const Equipment = require('../src/models/Equipment');

  // ── Station ────────────────────────────────────────────────────────────────
  let station = await Station.findOne({ code: 'AES-KD' });
  if (!station) {
    station = await Station.create({
      name:     'Ajaokuta Steel (Kogi)',
      region:   'North Central',
      location: 'Kogi State, Nigeria',
      code:     'AES-KD',
    });
    console.log('✅ Station created:', station.name);
  } else {
    console.log('⏭  Station exists:', station.name);
  }

  // ── Demo users for every role ──────────────────────────────────────────────
  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`⏭  ${u.role.padEnd(16)} exists  ${u.email}`);
      continue;
    }
    await User.create({
      email:        u.email,
      passwordHash: await bcrypt.hash(u.password, 10),
      firstName:    u.firstName,
      lastName:     u.lastName,
      role:         u.role,
      stationId:    u.scoped === 'station' ? station._id : null,
      regionId:     u.scoped === 'region' ? 'North Central' : null,
    });
    console.log(`✅ ${u.role.padEnd(16)} created  ${u.email}  /  ${u.password}`);
  }

  // ── Equipment ──────────────────────────────────────────────────────────────
  const eqNames = [
    { name: 'Transformer T1', type: 'Transformer' },
    { name: 'Feeder F1',      type: 'Feeder'      },
    { name: 'Feeder F2',      type: 'Feeder'      },
    { name: 'Bus Bar BB1',    type: 'Bus Bar'      },
  ];

  for (const eq of eqNames) {
    const exists = await Equipment.findOne({ name: eq.name, stationId: station._id });
    if (!exists) {
      await Equipment.create({ ...eq, stationId: station._id, slaTarget: 95 });
      console.log('✅ Equipment created:', eq.name);
    } else {
      console.log('⏭  Equipment exists:', eq.name);
    }
  }

  console.log('\n🎉  Seed complete. Demo credentials (8 roles):');
  for (const u of DEMO_USERS) {
    console.log(`   ${u.role.padEnd(16)}  ${u.email.padEnd(34)}  ${u.password}`);
  }
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
