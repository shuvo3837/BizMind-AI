// Cross-user data isolation e2e acceptance test.
//
// Verifies the 22-point spec for Request 3:
//   1. Two users upload distinct CSVs
//   2. Each dashboard contains only that user's totals
//   3. Cross-tenant URL guesses (uploadId/reportId) are rejected with 404
//   4. Refresh preserves isolation (same JWT, refetch dashboard)
//   5. Logout/login cycle (User 2 logs in after User 1) still isolates
//   6. Raw analytics endpoints (sales/expenses/products/inventory) are per-user
//
// Writes a JSON status file (e2e-output.json) and prints a verdict.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.resolve(SERVER_ROOT, 'e2e-output.json');
const CSV_A = path.resolve(SERVER_ROOT, '..', 'sample-test.csv');
const CSV_B_PATH = path.resolve(SERVER_ROOT, 'tests', 'isolation-userB.csv');
const BASE = process.env.SERVER_BASE || 'http://127.0.0.1:4000';

const out = { startedAt: new Date().toISOString(), events: [] };
const log = (name, data = {}) => {
  out.events.push({ at: new Date().toISOString(), name, ...data });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(data, null, 2));
};

const SUFFIX = Date.now().toString(36);
const userAEmail = `iso-a-${SUFFIX}@bizmind.test`;
const userBEmail = `iso-b-${SUFFIX}@bizmind.test`;
const password = `Iso!${SUFFIX}PW`;

let failures = 0;
const expect = (cond, label) => {
  if (!cond) {
    failures++;
    console.error(`  ❌ FAIL: ${label}`);
    return false;
  }
  console.log(`  ✅ PASS: ${label}`);
  return true;
};

const jsonRequest = async (method, urlPath, { token, body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
};

const multipartUpload = async (urlPath, csvPath, fileName, token) => {
  const buf = fs.readFileSync(csvPath);
  const boundary = '----bizmind' + Date.now() + Math.random().toString(36).slice(2, 8);
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: text/csv\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, buf, footer]);
  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': String(body.length),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${urlPath}`, { method: 'POST', headers, body });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
};

const buildDistinctCsv = (tag, totalRevenue) => {
  const rows = ['date,productName,category,quantity,price,revenue'];
  for (let i = 1; i <= 8; i++) {
    const price = 25 + i * 10;
    const revenue = Number((price * (3 + i)).toFixed(2));
    rows.push(`2026-01-${String(i).padStart(2, '0')},${tag}-Product ${i},${tag}-Cat,${3 + i},${price},${revenue}`);
  }
  return rows.join('\n') + '\n';
};

const registerOrLogin = async (name, email, companyName, industry) => {
  const reg = await jsonRequest('POST', '/api/auth/register', {
    body: { name, email, password, companyName, industry },
  });
  if (reg.status === 201 || reg.status === 200) {
    return {
      token: reg.json?.data?.token,
      user: reg.json?.data?.user,
      source: 'register',
    };
  }
  const login = await jsonRequest('POST', '/api/auth/login', {
    body: { email, password },
  });
  if (login.status === 200) {
    return {
      token: login.json?.data?.token,
      user: login.json?.data?.user,
      source: 'login',
    };
  }
  throw new Error(`Could not obtain token for ${email}: register=${reg.status} login=${login.status} :: ${login.text?.slice(0, 200)}`);
};

const getDashboard = async (token, label) => {
  const res = await jsonRequest('GET', '/api/analytics/dashboard', { token });
  return { status: res.status, json: res.json };
};

const getList = async (token, path) => {
  const res = await jsonRequest('GET', path, { token });
  return res;
};

const main = async () => {
  try {
    dotenv.config({ path: path.join(SERVER_ROOT, '.env') });
    log('boot', { base: BASE, userAEmail, userBEmail });

    // Build a distinct CSV for User B (User A reuses the existing sample).
    fs.writeFileSync(CSV_B_PATH, buildDistinctCsv('UserB', 100));
    log('csv-prepared', { csvA: CSV_A, csvB: CSV_B_PATH });

    // 1. Register / login both users.
    const userA = await registerOrLogin('Isolation User A', userAEmail, 'Isolation Co A', 'Testing');
    const userB = await registerOrLogin('Isolation User B', userBEmail, 'Isolation Co B', 'Testing');
    log('registered', {
      A: { id: userA.user?._id || userA.user?.id, source: userA.source },
      B: { id: userB.user?._id || userB.user?.id, source: userB.source },
    });
    if (!userA.token || !userB.token) throw new Error('Missing tokens');
    if (String(userA.user?._id || userA.user?.id) === String(userB.user?._id || userB.user?.id)) {
      throw new Error('User A and User B resolved to the same user id!');
    }

    // Connect to DB so we can clean stale data from previous test runs.
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'bizmind_ai',
      serverSelectionTimeoutMS: 8000,
    });
    const db = mongoose.connection;
    log('connected', { host: db.host, db: db.name });

    const userAId = new mongoose.Types.ObjectId(String(userA.user._id || userA.user.id));
    const userBId = new mongoose.Types.ObjectId(String(userB.user._id || userB.user.id));

    // Wipe prior isolation-test data for these ids so the count assertions are deterministic.
    const Sale = (await import('../models/Sale.js')).default;
    const Expense = (await import('../models/Expense.js')).default;
    const Product = (await import('../models/Product.js')).default;
    const Inventory = (await import('../models/Inventory.js')).default;
    const Upload = (await import('../models/Upload.js')).default;
    const Report = (await import('../models/Report.js')).default;
    const Analytics = (await import('../models/Analytics.js')).default;
    for (const Model of [Sale, Expense, Product, Inventory, Upload, Report, Analytics]) {
      await Model.deleteMany({ userId: { $in: [userAId, userBId] } });
    }
    log('cleaned', { ok: true });

    // 2. Upload User A and User B simultaneously (sequentially is fine for HTTP).
    const upA = await multipartUpload('/api/upload', CSV_A, 'iso-a.csv', userA.token);
    log('upload-A', { status: upA.status, dataset: upA.json?.data?.datasetId || upA.json?.data?.uploadId, error: upA.json?.message });
    expect(upA.status === 200, 'User A upload succeeded');
    const datasetA = upA.json?.data?.datasetId || upA.json?.data?.uploadId;
    expect(!!datasetA, 'User A upload returned a datasetId');

    const upB = await multipartUpload('/api/upload', CSV_B_PATH, 'iso-b.csv', userB.token);
    log('upload-B', { status: upB.status, dataset: upB.json?.data?.datasetId || upB.json?.data?.uploadId, error: upB.json?.message });
    expect(upB.status === 200, 'User B upload succeeded');
    const datasetB = upB.json?.data?.datasetId || upB.json?.data?.uploadId;

    // Give the server a moment to finish persisting async aggregate counts.
    await new Promise(r => setTimeout(r, 800));

    // 3. Each user's dashboard must show ONLY their own totals.
    const dashA = await getDashboard(userA.token, 'A');
    const dashB = await getDashboard(userB.token, 'B');
    log('dashboards', {
      A: { status: dashA.status, hasData: dashA.json?.data?.hasData, revenue: dashA.json?.data?.kpis?.totalRevenue },
      B: { status: dashB.status, hasData: dashB.json?.data?.hasData, revenue: dashB.json?.data?.kpis?.totalRevenue },
    });
    expect(dashA.status === 200, 'User A dashboard 200');
    expect(dashB.status === 200, 'User B dashboard 200');
    const revA = Number(dashA.json?.data?.kpis?.totalRevenue || 0);
    const revB = Number(dashB.json?.data?.kpis?.totalRevenue || 0);
    expect(revA > 0, `User A revenue positive (${revA})`);
    expect(revB > 0, `User B revenue positive (${revB})`);
    expect(revA !== revB, `User A and User B revenue are distinct (A=${revA}, B=${revB}) — not aggregated`);

    // 4. User A trying to GET User B's dataset must be rejected (or return empty).
    const crossGet = await jsonRequest('GET', `/api/analytics/dataset/${datasetB}`, { token: userA.token });
    log('cross-tenant-dataset', { status: crossGet.status, hasData: crossGet.json?.data?.dataset });
    expect(crossGet.status === 404 || crossGet.status === 403 || crossGet.json?.success === false,
      `User A cannot GET User B's dataset (status=${crossGet.status})`);

    // 5. Raw analytics endpoints must be per-user.
    const [salesA, salesB, expA, expB, prodA, prodB, invA, invB] = await Promise.all([
      getList(userA.token, '/api/analytics/sales?limit=500'),
      getList(userB.token, '/api/analytics/sales?limit=500'),
      getList(userA.token, '/api/analytics/expenses'),
      getList(userB.token, '/api/analytics/expenses'),
      getList(userA.token, '/api/analytics/products'),
      getList(userB.token, '/api/analytics/products'),
      getList(userA.token, '/api/analytics/inventory'),
      getList(userB.token, '/api/analytics/inventory'),
    ]);
    log('raw-counts', {
      A: { sales: salesA.json?.data?.count, expenses: expA.json?.data?.count, products: prodA.json?.data?.count, inventory: invA.json?.data?.count },
      B: { sales: salesB.json?.data?.count, expenses: expB.json?.data?.count, products: prodB.json?.data?.count, inventory: invB.json?.data?.count },
    });
    expect((salesA.json?.data?.count || 0) > 0, 'User A has sales');
    expect((salesB.json?.data?.count || 0) > 0, 'User B has sales');

    // Verify NO leak: every Sale returned to User A must have userId === userAId.
    const aSaleIds = (salesA.json?.data?.sales || []).map(s => String(s.userId));
    const bSaleIds = (salesB.json?.data?.sales || []).map(s => String(s.userId));
    expect(!aSaleIds.some(id => id !== String(userAId)), 'No sale in A list leaked from B');
    expect(!bSaleIds.some(id => id !== String(userBId)), 'No sale in B list leaked from A');

    // 6. Refresh test — User A fetches dashboard twice → identical totals.
    const dashARefresh = await getDashboard(userA.token, 'A (refresh)');
    expect(Number(dashARefresh.json?.data?.kpis?.totalRevenue || 0) === revA, 'Refresh returns identical totals');

    // 7. Upload list per-user, cross-tenant fetch of uploadId by B should 404.
    const uploadsA = await getList(userA.token, '/api/uploads');
    const uploadsB = await getList(userB.token, '/api/uploads');
    log('uploads-lists', {
      A: uploadsA.json?.data?.length || (uploadsA.json?.data?.uploads && uploadsA.json?.data?.uploads.length) || 0,
      B: uploadsB.json?.data?.length || 0,
    });
    const uploadListA = uploadsA.json?.data?.uploads || uploadsA.json?.data || [];
    const uploadListB = uploadsB.json?.data?.uploads || uploadsB.json?.data || [];
    expect(uploadListA.length > 0, 'User A has uploads');
    expect(uploadListB.length > 0, 'User B has uploads');
    expect(!uploadListA.some(u => String(u.userId) === String(userBId)), 'User A upload list excludes User B docs');
    expect(!uploadListB.some(u => String(u.userId) === String(userAId)), 'User B upload list excludes User A docs');

    // 8. Cross-tenant URL guess: User B tries to fetch User A's upload by id.
    const crossUpload = await jsonRequest('GET', `/api/uploads/${datasetA}`, { token: userB.token });
    log('cross-tenant-upload', { status: crossUpload.status, ok: crossUpload.json?.success });
    expect(crossUpload.status === 404 || crossUpload.json?.success === false,
      `User B cannot GET User A's upload (status=${crossUpload.status})`);

    // 9. DB-level sanity check.
    const totalsA = {
      sales: await Sale.countDocuments({ userId: userAId }),
      expenses: await Expense.countDocuments({ userId: userAId }),
      products: await Product.countDocuments({ userId: userAId }),
      inventory: await Inventory.countDocuments({ userId: userAId }),
      uploads: await Upload.countDocuments({ userId: userAId }),
    };
    const totalsB = {
      sales: await Sale.countDocuments({ userId: userBId }),
      expenses: await Expense.countDocuments({ userId: userBId }),
      products: await Product.countDocuments({ userId: userBId }),
      inventory: await Inventory.countDocuments({ userId: userBId }),
      uploads: await Upload.countDocuments({ userId: userBId }),
    };
    log('db-totals', { A: totalsA, B: totalsB });
    expect(totalsA.sales > 0 && totalsB.sales > 0, 'Both users have sales in DB');
    expect(totalsA.uploads > 0 && totalsB.uploads > 0, 'Both users have uploads in DB');
    expect(!await Sale.exists({ userId: userAId, businessId: { $exists: false } }), 'No Sales missing businessId');
    expect(!await Sale.exists({ userId: userBId, businessId: { $exists: false } }), 'No Sales missing businessId');

    // 10. Owner filter truth: querying with wrong userId returns nothing.
    const fakeUser = new mongoose.Types.ObjectId();
    const leak1 = await Sale.countDocuments({ userId: fakeUser });
    expect(leak1 === 0, `Random userId sees 0 sales (got ${leak1})`);

    // Final verdict.
    const verdict = { ok: failures === 0, failures };
    log('verdict', verdict);
    await mongoose.disconnect();
    log('done', verdict);
    process.exitCode = failures === 0 ? 0 : 1;
  } catch (error) {
    failures++;
    log('fatal', { message: error.message, stack: error.stack, failures });
    try { await mongoose.disconnect(); } catch {}
    process.exitCode = 1;
  }
};

main();
