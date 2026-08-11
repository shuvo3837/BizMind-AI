// End-to-end verification: uploads sample CSV to running server, reads
// /api/analytics/dashboard, then queries MongoDB directly to confirm the
// persisted docs all carry userId. All output is written to e2e-output.json
// so we can read it from a fresh shell.
const fs = require('fs');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '4000', 10);
const CSV = path.resolve(__dirname, '..', '..', 'sample-test.csv');
const OUT = path.resolve(__dirname, '..', 'e2e-output.json');

const result = { startedAt: new Date().toISOString(), steps: [] };
const step = (name, data) => {
  result.steps.push({ name, ...data });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
};

function readBody(res) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    res.on('error', reject);
  });
}

function request({ method, pathname, headers = {}, body, timeoutMs = 20000 }) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: HOST, port: PORT, method, path: pathname, headers, timeout: timeoutMs }, async (res) => {
      try {
        const text = await readBody(res);
        resolve({ status: res.statusCode, body: text });
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('HTTP timeout after ' + timeoutMs + 'ms')));
    if (body) req.write(body);
    req.end();
  });
}

function multipart({ filePath, filename, boundary }) {
  const data = fs.readFileSync(filePath);
  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: text/csv\r\n\r\n`);
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([head, data, tail]);
}

(async () => {
  try {
    step('start', { csv: CSV });

    const boundary = '----BizMindTestBoundary' + Date.now();
    const payload = multipart({ filePath: CSV, filename: 'sample-test.csv', boundary });
    const upRes = await request({
      method: 'POST',
      pathname: '/api/upload',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(payload),
      },
      body: payload,
    });
    step('upload', { status: upRes.status, body: upRes.body });

    const aRes = await request({ method: 'GET', pathname: '/api/analytics/dashboard' });
    step('analytics', { status: aRes.status, body: aRes.body });

    // Direct DB sanity check using the same MONGODB_URI.
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'bizmind_ai';
    if (uri) {
      try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 5000 });
        const Sale = require('../models/Sale');
        const Expense = require('../models/Expense');
        const Product = require('../models/Product');
        const Inventory = require('../models/Inventory');
        const Upload = require('../models/Upload');
        const [sales, expenses, products, inventory, uploads] = await Promise.all([
          Sale.find({}).select('businessId userId productName').lean(),
          Expense.find({}).select('businessId userId category amount').lean(),
          Product.find({}).select('businessId userId name').lean(),
          Inventory.find({}).select('businessId userId productName').lean(),
          Upload.find({}).select('businessId userId originalName status').lean(),
        ]);
        step('db', {
          salesCount: sales.length,
          expensesCount: expenses.length,
          productsCount: products.length,
          inventoryCount: inventory.length,
          uploadsCount: uploads.length,
          salesUserIdSample: sales[0]?.userId?.toString() || null,
          salesBizIdSample: sales[0]?.businessId?.toString() || null,
          productNames: products.map((p) => p.name),
          inventoryProducts: inventory.map((i) => i.productName),
          salesProductNames: sales.map((s) => s.productName),
          anySalesMissingUserId: sales.some((s) => !s.userId),
          anyProductsMissingUserId: products.some((p) => !p.userId),
          anyInventoryMissingUserId: inventory.some((i) => !i.userId),
        });
        await mongoose.disconnect();
      } catch (dbErr) {
        step('db', { error: dbErr.message });
      }
    } else {
      step('db', { skipped: 'MONGODB_URI not set' });
    }

    result.finishedAt = new Date().toISOString();
    fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    result.error = err.message;
    result.stack = err.stack;
    fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
    process.exit(1);
  }
})();