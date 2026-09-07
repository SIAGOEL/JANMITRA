// Zero-setup local MongoDB for development.
// Spins up a real mongod (via mongodb-memory-server) bound to a fixed port so the
// backend's default MONGODB_URI (mongodb://127.0.0.1:27017/kora) works with no install.
// Data persists in ./.mongo-data for the lifetime of this process.
// Use this ONLY for local dev — for anything real, install MongoDB or use Atlas.
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = Number(process.env.DB_PORT || 27017);
const dbPath = path.join(__dirname, '..', '.mongo-data');
fs.mkdirSync(dbPath, { recursive: true });

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: PORT, dbName: 'kora', dbPath, storageEngine: 'wiredTiger' },
  });

  console.log(`✅ Dev MongoDB ready at ${mongod.getUri()}`);
  console.log('   (leave this running in its own terminal; Ctrl+C to stop)');

  const shutdown = async () => {
    console.log('\n🛑 Stopping dev MongoDB ...');
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep the process alive.
  setInterval(() => {}, 1 << 30);
})().catch((err) => {
  console.error('❌ Failed to start dev MongoDB:', err);
  process.exit(1);
});
