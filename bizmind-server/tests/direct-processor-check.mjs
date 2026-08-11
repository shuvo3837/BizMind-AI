// Direct test of fileProcessor + DB inserts (no HTTP server required).
// Uses dynamic import() because the project is ESM ("type": "module").
// Writes a JSON status file we can inspect afterwards.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT = path.resolve(__dirname, '..', 'processor-test-output.json');

const out = { startedAt: new Date().toISOString(), events: [] };
const log = (name, data = {}) => {
  out.events.push({ at: new Date().toISOString(), name, ...data });
  try {
    fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  } catch (e) {
    console.error('[log] write failed:', e.message);
  }
};

const main = async () => {
  try {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
    log('boot', { uri: !!process.env.MONGODB_URI, envFile: process.env.NODE_ENV });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'bizmind_ai',
      serverSelectionTimeoutMS: 8000,
    });
    log('connected', { host: mongoose.connection.host, db: mongoose.connection.name });

    const { processUpload } = await import('../services/fileProcessor.js');
    const Sale = (await import('../models/Sale.js')).default;
    const Expense = (await import('../models/Expense.js')).default;
    const Product = (await import('../models/Product.js')).default;
    const Inventory = (await import('../models/Inventory.js')).default;
    const Upload = (await import('../models/Upload.js')).default;
    const Business = (await import('../models/Business.js')).default;
    const User = (await import('../models/User.js')).default;

    // Reusable test user
    const testEmail = 'processor-test@example.com';
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = await User.create({
        email: testEmail,
        password: 'x',
        name: 'Processor Test User',
        role: 'owner',
      });
    }
    const userId = user._id;

    let biz = await Business.findOne({ ownerId: userId, companyName: 'Processor Test Workspace' });
    if (!biz) {
      biz = await Business.create({
        ownerId: userId,
        companyName: 'Processor Test Workspace',
        industry: 'Testing',
        currency: 'USD',
      });
    }
    const businessId = biz._id;
    log('seed', { userId: String(userId), businessId: String(businessId) });

    const csvPath = path.resolve(__dirname, '..', '..', 'sample-test.csv');
    log('csv', { csvPath, exists: fs.existsSync(csvPath) });
    if (!fs.existsSync(csvPath)) throw new Error('sample-test.csv missing at ' + csvPath);
    const stat = fs.statSync(csvPath);

    const result = await processUpload({
      file: {
        path: csvPath,
        originalname: 'sample-test.csv',
        filename: 'sample-test.csv',
        mimetype: 'text/csv',
        size: stat.size,
      },
      businessId,
      userId,
    });
    log('processUpload.ok', { summary: result.summary, uploadId: String(result.uploadId) });

    const sample = async (Model, label) => {
      const docs = await Model.find({ businessId }).sort({ createdAt: -1 }).limit(2).lean();
      const total = await Model.countDocuments({ businessId });
      const withUserId = await Model.countDocuments({ businessId, userId });
      log(label, { total, withUserId, sampleUserIds: docs.map(d => String(d.userId)) });
      return { total, withUserId };
    };

    const saleStats = await sample(Sale, 'sales');
    const expenseStats = await sample(Expense, 'expenses');
    const productStats = await sample(Product, 'products');
    const inventoryStats = await sample(Inventory, 'inventory');
    const uploadStats = await sample(Upload, 'uploads');

    const ok =
      saleStats.withUserId === saleStats.total &&
      expenseStats.withUserId === expenseStats.total &&
      productStats.withUserId === productStats.total &&
      inventoryStats.withUserId === inventoryStats.total &&
      uploadStats.withUserId === uploadStats.total &&
      (saleStats.total + expenseStats.total + productStats.total + inventoryStats.total) > 0;

    log('verdict', { ok });

    await mongoose.disconnect();
    log('done', { ok });
  } catch (error) {
    log('fatal', { message: error.message, stack: error.stack });
    try { await mongoose.disconnect(); } catch {}
    process.exitCode = 1;
  }
};

main();