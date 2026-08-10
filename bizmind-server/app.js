import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { requestLogger } from './middleware/loggerMiddleware.js';
import { requireDb } from './middleware/requireDb.js';
// Note: errorHandler and notFoundHandler are mounted in server.js after Vite so that
// unmatched non-API requests fall through to the React SPA, not a JSON 404.
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// Trust proxy if behind one
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000,http://localhost:4000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(null, true); // permissive in dev; tighten in production via env
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logging
app.use(requestLogger);

// Health endpoint (always available, even before the React app)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BizMind AI backend is running',
    data: {
      service: 'BizMind AI Backend',
      timestamp: new Date().toISOString(),
      database: req.app.locals.dbConnected ? 'connected' : 'disconnected',
    },
  });
});

// Root info endpoint (for API-only access; the React app handles `/`)
app.get('/api', (req, res) => res.redirect('/api/health'));

// Mount API routes
// Auth routes handle their own login/register which must still respond even
// when Mongo is down, so they stay unguarded. Everything else requires an
// active Mongo connection — anything that needs to read/write data returns
// 503 when the database is offline rather than fabricating an empty payload.
app.use('/api/auth', authRoutes);
app.use('/api/business', requireDb, businessRoutes);
app.use('/api/upload', requireDb, uploadRoutes);
app.use('/api/uploads', requireDb, uploadRoutes); // backward-compatible alias
app.use('/api/analytics', requireDb, analyticsRoutes);
app.use('/api/report', requireDb, reportRoutes);
app.use('/api/reports', requireDb, reportRoutes); // backward-compatible alias
app.use('/api/ai', requireDb, aiRoutes);
app.use('/api/chat', requireDb, chatRoutes);
app.use('/api/dashboard', requireDb, dashboardRoutes);
app.use('/api/inventory', requireDb, inventoryRoutes);

// NOTE: The 404 handler and error handler are registered in server.js AFTER the
// Vite middleware is mounted, so that any non-API GET request falls through to
// the React app (which then handles client-side routing via React Router).
// We still export them here so server.js can mount them in the right order.
export { notFoundHandler, errorHandler };

export default app;
