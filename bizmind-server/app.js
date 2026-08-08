import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'BizMind AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', aiRoutes);

// Error Handler Middleware
app.use(errorHandler);

export default app;
