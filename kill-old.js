// kill-old.js - one-time cleanup of stuck Node processes from previous attempts
// Run with: node kill-old.js
// This script:
//   1. Finds all node.exe processes
//   2. Kills any that are holding ports 3000 or 4000
//   3. Exits cleanly

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const log = (...args) => console.log('[cleanup]', ...args);

async function getNetstatLines() {
  try {
    // Use cmd /c to run netstat on Windows reliably
    const { stdout } = await execAsync('netstat -ano', { windowsHide: true });
    return stdout.split(/\r?\n/);
  } catch (err) {
    log('netstat failed:', err.message);
    return [];
  }
}

async function killPid(pid) {
  try {
    await execAsync(`taskkill /PID ${pid} /F`, { windowsHide: true });
    log(`killed PID ${pid}`);
    return true;
  } catch (err) {
    log(`could not kill PID ${pid}: ${err.message}`);
    return false;
  }
}

async function findPidsOnPorts(ports) {
  const lines = await getNetstatLines();
  const pids = new Set();
  for (const line of lines) {
    const m = line.match(/\s+(?:TCP|UDP)\s+[\d.:]+:(\d+)\s+[\d.:]+:\d+\s+(?:LISTENING|ESTABLISHED)\s+(\d+)/i);
    if (!m) continue;
    const port = parseInt(m[1], 10);
    const pid = parseInt(m[2], 10);
    if (ports.includes(port) && pid > 0) {
      pids.add(pid);
    }
  }
  return [...pids];
}

const ports = [3000, 4000, 5173];
const pids = await findPidsOnPorts(ports);

if (pids.length === 0) {
  log('no stuck processes on ports', ports, '- all good');
} else {
  log(`found ${pids.length} process(es) on ports ${ports.join(', ')}:`, pids.join(', '));
  for (const pid of pids) {
    await killPid(pid);
  }
}

process.exit(0);