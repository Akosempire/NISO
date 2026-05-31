require('dotenv').config();
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'niso_db',
      serverSelectionTimeoutMS: 8000
    });
    console.log('CONNECT OK');
    process.exit(0);
  } catch (e) {
    console.log('TOP ERROR NAME:', e.name);
    console.log('TOP ERROR MSG:', e.message);
    if (e.reason && e.reason.servers) {
      for (const [host, sd] of e.reason.servers) {
        console.log('---', host, '---');
        console.log('  type:', sd.type);
        console.log('  error:', sd.error && (sd.error.message || sd.error.toString()));
        if (sd.error && sd.error.code) console.log('  code:', sd.error.code);
        if (sd.error && sd.error.cause) console.log('  cause:', sd.error.cause.message || sd.error.cause);
      }
    }
    process.exit(1);
  }
})();
