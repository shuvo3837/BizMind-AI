import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import app from './bizmind-server/app.js';
import { initializeDatabase } from './bizmind-server/database/connect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve shared deps from the server folder (has its own node_modules with dotenv)
const serverRequire = createRequire(path.join(__dirname, 'bizmind-server', 'package.json') + '/');

// Resolve vite via the client folder (in case root node_modules is missing it)
const clientRequire = createRequire(path.join(__dirname, 'bizmind-client', 'package.json') + '/');

// Load server-side env vars from bizmind-server/.env (so Mongo + JWT + AI keys are visible here)
const dotenv = serverRequire('dotenv');
dotenv.config({ path: path.join(__dirname, 'bizmind-server', '.env') });

const { createServer: createViteServer } = clientRequire('vite');

const PORT = parseInt(process.env.PORT, 10) || 3000;

async function startFullStackServer() {
  // Connect to MongoDB BEFORE listening so every request sees a working DB.
  // Falls back to mongodb-memory-server automatically when Atlas is unreachable.
  let dbInitError = null;
  try {
    const db = await initializeDatabase();
    app.locals.dbConnected = true;
    app.locals.dbBackend = db?.connection?.host || 'unknown';
    console.log(`✅ MongoDB ready on backend: ${app.locals.dbBackend}`);
  } catch (err) {
    dbInitError = err;
    app.locals.dbConnected = false;
    console.error('❌ MongoDB initialization failed:', err.message);
    console.error('   The server will start, but DB endpoints will return 503 until reachable.');
  }

  // Vite middleware for live preview rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.join(__dirname, 'bizmind-client'),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'bizmind-client', 'dist');
    app.use((await import('express')).default.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BizMind AI Full-Stack Platform active at http://0.0.0.0:${PORT}`);
    console.log(`🔗 API health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'configured' : 'not configured (placeholder)'}`);
    console.log(`⚡ Groq:   ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' ? 'configured' : 'not configured (placeholder)'}`);
  });
}

startFullStackServer().catch((err) => {
  console.error('❌ Failed to start BizMind AI Full-Stack Platform:', err);
  process.exit(1);
});
