// Test pipeline: health, upload, dashboard analytics
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:4000';

const get = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () =>
          resolve({ status: res.statusCode, body, headers: res.headers })
        );
      })
      .on('error', reject);
  });

const post = (url, opts = {}) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        method: 'POST',
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers: opts.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });

const postForm = (url, fields, file) => {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const boundary = '----BizMindTest' + Date.now();
    const fileData = fs.readFileSync(file.path);
    const parts = [];

    for (const [k, v] of Object.entries(fields)) {
      parts.push(
        `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`
      );
    }

    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type || 'text/csv'}\r\n\r\n`
    );

    const body = Buffer.concat([
      Buffer.from(parts.join('')),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const req = http.request(
      {
        method: 'POST',
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
        },
      },
      (res) => {
        let r = '';
        res.on('data', (c) => (r += c));
        res.on('end', () => resolve({ status: res.statusCode, body: r }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const log = (label, obj) => {
  console.log(`\n=== ${label} ===`);
  if (typeof obj === 'string') {
    try {
      console.log(JSON.stringify(JSON.parse(obj), null, 2));
    } catch {
      console.log(obj);
    }
  } else {
    console.log(JSON.stringify(obj, null, 2));
  }
};

(async () => {
  try {
    const health = await get(`${BASE}/api/health`);
    log('Health', health.body);

    const uploads = await get(`${BASE}/api/upload`);
    log('Uploads (initial)', uploads.body);

    const dashboard = await get(`${BASE}/api/analytics/dashboard`);
    log('Dashboard Analytics (initial)', dashboard.body);

    // Find a sample CSV in the repo
    const candidates = [
      path.join(__dirname, 'bizmind-server', 'uploads'),
      path.join(__dirname, 'bizmind-server', 'samples'),
      path.join(__dirname, 'samples'),
      path.join(__dirname, 'test-data'),
      __dirname,
    ];
    let csvPath = null;
    for (const dir of candidates) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.csv'));
      if (files.length) {
        csvPath = path.join(dir, files[0]);
        break;
      }
    }

    if (!csvPath) {
      console.log('\nNo CSV in candidates. Creating one...');
      csvPath = path.join(__dirname, 'sample-test.csv');
      fs.writeFileSync(
        csvPath,
        'date,productName,category,quantity,unitPrice,cost,stock\n' +
          '2024-01-15,Wireless Mouse,Electronics,15,29.99,12.50,80\n' +
          '2024-02-03,Mechanical Keyboard,Electronics,8,89.99,42.00,40\n' +
          '2024-02-20,USB-C Hub,Electronics,22,49.99,18.50,120\n' +
          '2024-03-11,Office Chair,Furniture,5,299.99,140.00,18\n' +
          '2024-03-22,Desk Lamp,Furniture,12,39.99,15.50,55\n' +
          '2024-04-05,Notebook Bundle,Stationery,40,12.99,4.50,200\n'
      );
    }

    log('Upload', { file: csvPath });

    const uploadResult = await postForm(
      `${BASE}/api/upload`,
      { businessId: '000000000000000000000002' },
      { path: csvPath, name: path.basename(csvPath), type: 'text/csv' }
    );
    log('Upload Response', uploadResult.body);

    const uploads2 = await get(`${BASE}/api/upload`);
    log('Uploads (after)', uploads2.body);

    const dashboard2 = await get(`${BASE}/api/analytics/dashboard`);
    log('Dashboard Analytics (after)', dashboard2.body);

    const aiRecs = await get(`${BASE}/api/ai/recommendations`);
    log('AI Recommendations', aiRecs.body);

    console.log('\nDONE');
  } catch (e) {
    console.error('FAILED:', e.message);
    console.error(e.stack);
  }
})();