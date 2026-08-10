// Test pipeline with detailed output
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const BASE = 'http://localhost:4000';
const OUT = path.join('C:', 'projects', 'New folder', 'BizMind-AI', 'test-output.log');

const write = (msg) => {
  fs.appendFileSync(OUT, msg + '\n');
  process.stdout.write(msg + '\n');
};

fs.writeFileSync(OUT, '');

const request = (method, url, body, headers = {}) =>
  new Promise((resolve) => {
    const u = new URL(url);
    const req = http.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers,
          })
        );
      }
    );
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (body) req.write(body);
    req.end();
  });

const postForm = (url, fields, file) =>
  new Promise((resolve) => {
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
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });

(async () => {
  try {
    write('=== HEALTH ===');
    const health = await request('GET', `${BASE}/api/health`);
    write(`HTTP ${health.status}`);
    write(health.body);
    write('');

    write('=== UPLOADS (BEFORE) ===');
    const up0 = await request('GET', `${BASE}/api/upload`);
    write(`HTTP ${up0.status}`);
    write(up0.body);
    write('');

    write('=== DASHBOARD (BEFORE) ===');
    const d0 = await request('GET', `${BASE}/api/analytics/dashboard`);
    write(`HTTP ${d0.status}`);
    write(d0.body);
    write('');

    const csvPath = path.join('C:', 'projects', 'New folder', 'BizMind-AI', 'sample-test.csv');
    if (!fs.existsSync(csvPath)) {
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

    write('=== UPLOAD ===');
    const upRes = await postForm(
      `${BASE}/api/upload`,
      { businessId: '000000000000000000000002' },
      { path: csvPath, name: 'sample-test.csv', type: 'text/csv' }
    );
    write(`HTTP ${upRes.status}`);
    write(upRes.body);
    write('');

    write('=== DASHBOARD (AFTER) ===');
    const d1 = await request('GET', `${BASE}/api/analytics/dashboard`);
    write(`HTTP ${d1.status}`);
    write(d1.body);
    write('');

    write('=== AI RECOMMENDATIONS ===');
    const ai = await request('GET', `${BASE}/api/ai/recommendations`);
    write(`HTTP ${ai.status}`);
    write(ai.body);
    write('');

    write('=== INVENTORY ===');
    const inv = await request('GET', `${BASE}/api/inventory`);
    write(`HTTP ${inv.status}`);
    write(inv.body);

    write('\nDONE');
  } catch (e) {
    write('ERROR: ' + e.message);
    write(e.stack || '');
  }
  process.exit(0);
})();