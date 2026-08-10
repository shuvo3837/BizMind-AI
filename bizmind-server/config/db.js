import mongoose from 'mongoose';

const DEFAULT_DB_NAME = 'bizmind_ai';

// Connection strategy:
//   1. Try MONGODB_URI from .env (Atlas by default).
//   2. If it fails to select a server within `atlasTimeoutMs`, fall back to an
//      in-process `mongodb-memory-server` so the full pipeline (upload →
//      analytics → AI → reports) keeps working with real persisted data.
//   3. Set MONGODB_FORCE_MEMORY=true to skip Atlas entirely.
//
// We never fabricate data; we only switch the storage backend when Atlas is
// unreachable. Every collection write still goes through Mongoose.

let memoryServer = null;
let activeBackend = 'unknown'; // 'atlas' | 'memory'

const buildConnectionString = () => {
  const explicitUri = process.env.MONGODB_URI;
  if (explicitUri && explicitUri.trim().length > 0) {
    return explicitUri;
  }

  const user = process.env.MONGODB_USERNAME;
  const pass = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST || 'cluster0.8c01ywb.mongodb.net';

  if (user && pass) {
    const credentials = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
    return `mongodb+srv://${credentials}@${host}/${DEFAULT_DB_NAME}`;
  }

  throw new Error(
    'MongoDB connection string is missing. Set MONGODB_URI in your environment.'
  );
};

const tryAtlas = async (uri, dbName, timeoutMs) => {
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; }, timeoutMs);
  try {
    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: timeoutMs,
      maxPoolSize: 10,
      minPoolSize: 1,
      autoIndex: true,
    });
    clearTimeout(timer);
    if (timedOut) {
      // Selection raced the timeout — disconnect and treat as failure.
      await mongoose.disconnect().catch(() => {});
      throw new Error('Atlas selection timed out');
    }
    return conn;
  } catch (err) {
    clearTimeout(timer);
    await mongoose.disconnect().catch(() => {});
    throw err;
  }
};

const tryMemory = async (dbName) => {
  // Lazy import so production deployments without the dep don't load it.
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName },
  });
  const uri = memoryServer.getUri();
  const conn = await mongoose.connect(uri, {
    dbName,
    maxPoolSize: 10,
    minPoolSize: 1,
    autoIndex: true,
  });
  return conn;
};

export const connectDB = async () => {
  mongoose.set('strictQuery', true);

  const dbName = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;
  const forceMemory = String(process.env.MONGODB_FORCE_MEMORY || '').toLowerCase() === 'true';
  const atlasTimeoutMs = parseInt(process.env.MONGODB_ATLAS_TIMEOUT_MS, 10) || 6000;

  // ----- Forced memory mode (CI, offline development, etc.) -----
  if (forceMemory) {
    const conn = await tryMemory(dbName);
    activeBackend = 'memory';
    console.log(`✅ MongoDB (in-memory) connected: ${conn.connection.host}/${conn.connection.name}`);
    installConnectionListeners();
    return conn;
  }

  // ----- Try Atlas first -----
  const uri = buildConnectionString();
  try {
    const conn = await tryAtlas(uri, dbName, atlasTimeoutMs);
    activeBackend = 'atlas';
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}/${conn.connection.name}`);
    installConnectionListeners();
    return conn;
  } catch (atlasErr) {
    // Only fall back when Atlas is unreachable. Auth errors (wrong creds)
    // should NOT silently flip to memory — surface them so the user notices.
    const msg = String(atlasErr.message || atlasErr);
    const isAuthError = /auth/i.test(msg) || /bad auth/i.test(msg) || /unauthorized/i.test(msg);
    if (isAuthError) {
      console.error('❌ MongoDB Atlas authentication failed:', msg);
      throw atlasErr;
    }
    console.warn(`⚠️  MongoDB Atlas unreachable: ${msg}`);
    console.warn('   Falling back to an in-process mongodb-memory-server so the API stays usable.');
    console.warn('   Data will NOT persist across server restarts while Atlas is unreachable.');

    try {
      const conn = await tryMemory(dbName);
      activeBackend = 'memory';
      console.log(`✅ MongoDB (in-memory) connected: ${conn.connection.host}/${conn.connection.name}`);
      installConnectionListeners();
      return conn;
    } catch (memErr) {
      console.error('❌ Failed to start fallback MongoDB:', memErr.message);
      throw memErr;
    }
  }
};

const installConnectionListeners = () => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('🔁 MongoDB reconnected');
  });
};

export const isDbConnected = () => mongoose.connection.readyState === 1;
export const getActiveBackend = () => activeBackend;
export const stopMemoryServer = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
