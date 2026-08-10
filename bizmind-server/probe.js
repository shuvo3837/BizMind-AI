// Tiny probe to test server health - won't hang
import http from 'node:http';

const REQ_TIMEOUT_MS = 3000;
const targets = [
  { host: '127.0.0.1', port: 4000, path: '/api/health', method: 'GET' },
  { host: '127.0.0.1', port: 4000, path: '/', method: 'GET' },
];

for (const t of targets) {
  await new Promise((resolve) => {
    const req = http.request(
      { host: t.host, port: t.port, path: t.path, method: t.method, timeout: REQ_TIMEOUT_MS },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          console.log(`[${t.method} ${t.path}] status=${res.statusCode} len=${body.length}`);
          console.log(body.slice(0, 800));
          console.log('---');
          resolve();
        });
      }
    );
    req.on('timeout', () => {
      console.log(`[${t.method} ${t.path}] TIMEOUT after ${REQ_TIMEOUT_MS}ms`);
      req.destroy();
      resolve();
    });
    req.on('error', (err) => {
      console.log(`[${t.method} ${t.path}] ERROR: ${err.code || err.message}`);
      resolve();
    });
    req.end();
  });
}

process.exit(0);