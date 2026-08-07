import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './bizmind-server/app.js';
import { initializeDatabase } from './bizmind-server/database/connect.js';

const PORT = 3000;

async function startFullStackServer() {
  await initializeDatabase();

  // Vite middleware for live preview rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BizMind AI Full-Stack Platform active at http://0.0.0.0:${PORT}`);
  });
}

startFullStackServer();
