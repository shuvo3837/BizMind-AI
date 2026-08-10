import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env first
dotenv.config({ path: path.join(__dirname, '.env') });

// The actual React frontend lives at the WORKSPACE ROOT (not in bizmind-client/).
// bizmind-client/ is a stale duplicate scaffold; we use the root's index.html + src/.
const repoRoot = path.join(__dirname, '..');
const viteNodeModules = path.join(repoRoot, 'bizmind-client', 'node_modules');
const viteEntryPath = path.join(viteNodeModules, 'vite', 'dist', 'node', 'index.js');
const viteInstalled = fs.existsSync(viteEntryPath);
const frontendRoot = repoRoot; // index.html and src/ live here
const frontendIndexHtml = path.join(frontendRoot, 'index.html');

// Ensure a `node_modules` link at the workspace root so Vite (root = repoRoot)
// can resolve react, react-dom, @tailwindcss/vite, etc. that physically live in
// `bizmind-client/node_modules/`. We try a Windows directory junction first
// (`mklink /J`); if that fails we fall back to a real symlink; if both fail we
// copy the bare minimum and warn loudly.
function ensureNodeModulesLink() {
  const linkPath = path.join(repoRoot, 'node_modules');
  if (fs.existsSync(linkPath)) return 'already present';

  if (process.platform === 'win32') {
    try {
      execSync(`cmd /c mklink /J "${linkPath}" "${viteNodeModules}"`, {
        stdio: 'ignore',
      });
      return 'mklink /J';
    } catch (err) {
      // fall through to symlink
    }
  }

  try {
    fs.symlinkSync(viteNodeModules, linkPath, 'junction');
    return 'symlink';
  } catch (err) {
    return `failed: ${err.message}`;
  }
}

const linkResult = ensureNodeModulesLink();
if (linkResult.startsWith('failed:')) {
  console.warn(`⚠️  Could not create node_modules link at workspace root (${linkResult}).`);
  console.warn('   Vite will likely fail to resolve packages. Run start.bat as administrator.');
} else if (linkResult !== 'already present') {
  console.log(`🔗 Created node_modules link via ${linkResult}.`);
}

// Find and kill any process listening on the given TCP port. Returns the
// array of PIDs that were killed. Uses `netstat -ano` on Windows, `lsof` on
// other platforms. This makes `npm start` self-cleaning so users don't have
// to remember to run `start.bat` first.
async function freePortIfBusy(port) {
  if (process.env.SKIP_PORT_CLEANUP === '1') return [];

  let stdout = '';
  try {
    if (process.platform === 'win32') {
      stdout = execSync(`netstat -ano | findstr ":${port}" | findstr "LISTENING"`, {
        encoding: 'utf8',
      });
    } else {
      stdout = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    }
  } catch {
    // `netstat` returns exit code 1 when there are no matches — that's fine.
    return [];
  }

  const pids = stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).pop())
    .filter((pid) => pid && /^\d+$/.test(pid) && Number(pid) !== process.pid);

  const killed = [];
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      killed.push(pid);
    } catch (err) {
      // best-effort
    }
  }
  if (killed.length) {
    console.log(`🔪 Killed ${killed.length} stuck process(es) on port ${port}: ${killed.join(', ')}`);
    // Give Windows a moment to release the socket.
    await new Promise((r) => setTimeout(r, 500));
  }
  return killed;
}

const startServer = async () => {
  const { connectDB, isDbConnected } = await import('./config/db.js');
  const { default: app, notFoundHandler, errorHandler } = await import('./app.js');

  // Try connecting to MongoDB in the background; do NOT block server start.
  (async () => {
    try {
      const db = await connectDB();
      app.locals.dbConnected = !!db && db.connection && db.connection.readyState === 1;
      console.log(`✅ MongoDB connected: ${db?.connection?.host || ''}/${db?.connection?.name || ''}`);
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed. Server is running but DB endpoints will fail until reachable.');
      console.warn('   Reason:', error.message);
      console.warn('   Fix: whitelist your IP in MongoDB Atlas, then restart the server.');
      app.locals.dbConnected = false;
    }
  })();

  // Mount the React frontend via Vite middleware.
  let viteMounted = false;

  if (viteInstalled && fs.existsSync(frontendIndexHtml)) {
    try {
      const viteUrl = pathToFileURL(viteEntryPath).href;
      const vite = await import(viteUrl);
      const viteServer = await vite.createServer({
        server: {
          middlewareMode: true,
          fs: {
            // Allow Vite to read from the workspace root and the bizmind-client
            // node_modules where all deps actually live.
            allow: [repoRoot, viteNodeModules],
            strict: false,
          },
        },
        appType: 'spa',
        root: frontendRoot,
        resolve: {
          preserveSymlinks: false,
        },
        // Tell Vite to use the actual node_modules folder for dependency optimization
        // and resolution (since they're nested inside bizmind-client/).
        cacheDir: path.join(viteNodeModules, '.vite'),
      });
      app.use(viteServer.middlewares);
      viteMounted = true;
      console.log(`🎨 Vite middleware mounted. Frontend root: ${frontendRoot}`);
      console.log(`   index.html: ${frontendIndexHtml}`);
      console.log(`   node_modules: ${viteNodeModules}`);
    } catch (err) {
      console.warn('⚠️  Vite failed to start:', err.message);
      if (err.stack) console.warn(err.stack.split('\n').slice(0, 5).join('\n'));
    }
  }

  // After Vite is mounted, register the JSON 404 handler and error handler.
  // Any unmatched GET that Vite couldn't handle (e.g. an unknown non-API route)
  // will fall through to the SPA via Vite; only true 404s reach this handler.
  app.use(notFoundHandler);
  app.use(errorHandler);

  if (!viteMounted) {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('⚠️  Frontend NOT served. Reason:');
    if (!viteInstalled) console.warn(`   Vite not found at ${viteEntryPath}`);
    if (!fs.existsSync(frontendIndexHtml)) console.warn(`   index.html not found at ${frontendIndexHtml}`);
    console.warn('   The API still works at /api/* — open /api/health to verify.');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Fallback landing page so the root URL is not blank.
    app.get('/', (_req, res) => {
      res.status(200).type('html').send(`
        <!doctype html>
        <html><head><meta charset="utf-8"><title>BizMind AI</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 16px; line-height: 1.55; color: #1f2937; }
          h1 { color: #2563eb; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
          .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #dbeafe; color: #1e3a8a; font-size: 0.8em; margin-right: 6px; }
          a { color: #2563eb; }
        </style></head><body>
          <h1>🧠 BizMind AI — Backend is live</h1>
          <p><span class="pill">API OK</span><span class="pill">DB ${process.env.MONGODB_URI ? 'configured' : 'missing'}</span></p>
          <p>The React frontend is not being served.</p>
          <p>Vite installed: <code>${viteInstalled}</code><br>index.html exists: <code>${fs.existsSync(frontendIndexHtml)}</code></p>
          <p>API endpoints:</p>
          <ul>
            <li><a href="/api/health">/api/health</a></li>
            <li>POST <code>/api/auth/register</code></li>
            <li>POST <code>/api/auth/login</code></li>
          </ul>
        </body></html>
      `);
    });
  }

  const PORT = parseInt(process.env.PORT, 10) || 4000;
  const HOST = process.env.HOST || '0.0.0.0';

  // If the previous run left a process holding PORT, kill it before binding.
  // This is the equivalent of `start.bat` step 1 for users who run `npm start`
  // directly without the .bat wrapper.
  await freePortIfBusy(PORT);

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 BizMind AI Backend listening on http://${HOST}:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'configured' : 'not configured (placeholder)'}`);
    console.log(`⚡ Groq: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' ? 'configured' : 'not configured (placeholder)'}`);
    console.log(`🔗 API health: http://${HOST}:${PORT}/api/health`);
    console.log(`🌐 Frontend:   http://${HOST}:${PORT}/${viteMounted ? ' (React app via Vite)' : ' (fallback HTML — see warning above)'}`);
    console.log(`\n👉 Open http://localhost:${PORT} in your browser.\n`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      try {
        const mongoose = (await import('mongoose')).default;
        if (isDbConnected && isDbConnected()) {
          await mongoose.disconnect();
          console.log('✅ MongoDB disconnected.');
        }
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });

  return server;
};

startServer().catch((err) => {
  console.error('❌ Failed to start BizMind AI Backend:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

export default startServer;
