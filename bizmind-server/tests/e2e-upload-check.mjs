// Full HTTP-level e2e: POST /api/upload -> GET /api/analytics/dashboard.
// Verifies 200 + hasData + MongoDB sanity. Writes a JSON status file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT = path.resolve(__dirname, '..', 'e2e-output.json');
const CSV = path.resolve(__dirname, '..', '..', 'sample-test.csv');
const BASE = process.env.SERVER_BASE || 'http://127.0.0.1:4000';

const out = { startedAt: new Date().toISOString(), events: [] };
const log = (name, data = {}) => {
  out.events.push({ at: new Date().toISOString(), name, ...data });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
};

const postUpload = async () => {
  const buf = fs.readFileSync(CSV);
  const boundary = '----bizmind' + Date.now();
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="sample-test.csv"\r\n` +
    `Content-Type: text/csv\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, buf, footer]);
  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, text, json };
};

const getDashboard = async () => {
  const res = await fetch(`${BASE}/api/analytics/dashboard`);
  const json = await res.json();
  return { status: res.status, json };
};

const main = async () => {
  try {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
    log('boot', { base: BASE, csv: CSV });

    const upload = await postUpload();
    const uploadSummary = upload.json?.summary ?? upload.json;
    log('upload', { status: upload.status, summary: uploadSummary, error: upload.json?.error });
    if (upload.status !== 200) throw new Error('upload failed: status=' + upload.status);

    const dash = await getDashboard();
    log('dashboard', { status: dash.status, hasData: dash.json?.data?.hasData, kpis: dash.json?.data?.kpis, summary: dash.json?.data?.summary });
    if (dash.status !== 200) throw new Error('dashboard failed: status=' + dash.status);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'bizmind_ai',
      serverSelectionTimeoutMS: 8000,
    });
    log('connected', { host: mongoose.connection.host, db: mongoose.connection.name });

    const Sale = (await import('../models/Sale.js')).default;
    const Expense = (await import('../models/Expense.js')).default;
    const Product = (await import('../models/Product.js')).default;
    const Inventory = (await import('../models/Inventory.js')).default;
    const Upload = (await import('../models/Upload.js')).default;
    const User = (await import('../models/User.js')).default;

    // Use the dev bypass owner id (the bypass injects 000000000000000000000001).
    const ownerId = new mongoose.Types.ObjectId('000000000000000000000001');
    const total = {
      sales: await Sale.countDocuments({ userId: ownerId }),
      expenses: await Expense.countDocuments({ userId: ownerId }),
      products: await Product.countDocuments({ userId: ownerId }),
      inventory: await Inventory.countDocuments({ userId: ownerId }),
      uploads: await Upload.countDocuments({ userId: ownerId }),
    };
    log('db', { ownerId: String(ownerId), total });

    const hasData =
      total.sales + total.expenses + total.products + total.inventory > 0 &&
      dash.json?.data?.hasData === true;

    log('verdict', { ok: hasData });

    await mongoose.disconnect();
    log('done', { ok: hasData });
  } catch (error) {
    log('fatal', { message: error.message, stack: error.stack });
    try { await mongoose.disconnect(); } catch {}
    process.exitCode = 1;
  }
};

main();