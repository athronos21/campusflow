import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import { execSync } from 'child_process';

interface CheckResult {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

async function runDoctor() {
  console.log('====================================================');
  console.log('[DOCTOR] CampusFlow Environment & Health Diagnostics');
  console.log('Haramaya University Pilot MVP - Ethiopian Higher Ed');
  console.log('====================================================\n');

  const results: CheckResult[] = [];

  // 1. Node.js Version Check
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
  if (major >= 20) {
    results.push({ name: 'Node.js Runtime', status: 'PASS', detail: `${nodeVersion} (Recommended v20+)` });
  } else if (major >= 18) {
    results.push({ name: 'Node.js Runtime', status: 'WARN', detail: `${nodeVersion} (v20+ recommended)` });
  } else {
    results.push({ name: 'Node.js Runtime', status: 'FAIL', detail: `${nodeVersion} (Upgrade to Node 20 LTS)` });
  }

  // 2. Package Manager (pnpm)
  try {
    const pnpmVersion = execSync('pnpm.cmd --version', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    results.push({ name: 'pnpm Workspace Manager', status: 'PASS', detail: `v${pnpmVersion}` });
  } catch {
    results.push({ name: 'pnpm Workspace Manager', status: 'WARN', detail: 'pnpm.cmd not found in current PATH' });
  }

  // 3. Git Repository Status
  try {
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    results.push({ name: 'Git Repository', status: 'PASS', detail: `Branch "${gitBranch}" at commit [${gitCommit}]` });
  } catch {
    results.push({ name: 'Git Repository', status: 'WARN', detail: 'Could not resolve git metadata' });
  }

  // 4. Flutter SDK Check
  try {
    const flutterVersionRaw = execSync('flutter --version', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    const firstLine = flutterVersionRaw.split('\n')[0].trim();
    results.push({ name: 'Flutter Mobile SDK', status: 'PASS', detail: firstLine });
  } catch {
    results.push({ name: 'Flutter Mobile SDK', status: 'WARN', detail: 'Flutter not in PATH or not installed' });
  }

  // 5. Environment Variables (.env)
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const hasDb = content.includes('DATABASE_URL');
    const hasJwt = content.includes('JWT_SECRET');
    if (hasDb && hasJwt) {
      results.push({ name: 'Environment Config (.env)', status: 'PASS', detail: 'Database URL and JWT configured' });
    } else {
      results.push({ name: 'Environment Config (.env)', status: 'WARN', detail: 'Missing required keys in .env' });
    }
  } else {
    results.push({ name: 'Environment Config (.env)', status: 'FAIL', detail: '.env not found (copy .env.example)' });
  }

  // 6. PostgreSQL Database Connection Port Probe
  const isPostgresPortOpen = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(5432, '127.0.0.1');
  });

  if (isPostgresPortOpen) {
    results.push({ name: 'PostgreSQL Database Port (5432)', status: 'PASS', detail: 'Port 5432 is OPEN and accepting connections' });
  } else {
    results.push({ name: 'PostgreSQL Database Port (5432)', status: 'WARN', detail: 'Port 5432 is CLOSED (Start Docker: docker compose up -d)' });
  }

  // 7. Monorepo App Directories Check
  const expectedDirs = [
    { name: 'API (NestJS)', path: 'apps/api' },
    { name: 'Web (Next.js 14)', path: 'apps/web' },
    { name: 'Mobile (Flutter)', path: 'apps/mobile' },
    { name: 'Contracts (Zod/TS)', path: 'packages/contracts' },
  ];

  for (const dir of expectedDirs) {
    const fullPath = path.resolve(process.cwd(), dir.path);
    if (fs.existsSync(fullPath)) {
      results.push({ name: `App: ${dir.name}`, status: 'PASS', detail: `Found at ${dir.path}` });
    } else {
      results.push({ name: `App: ${dir.name}`, status: 'FAIL', detail: `Missing directory ${dir.path}` });
    }
  }

  // Print Results Summary
  console.log('Results:');
  for (const r of results) {
    const symbol = r.status === 'PASS' ? '[PASS]' : r.status === 'WARN' ? '[WARN]' : '[FAIL]';
    console.log(`${symbol.padEnd(7)} ${r.name.padEnd(34)} : ${r.detail}`);
  }

  console.log('\n====================================================');
  const failures = results.filter((r) => r.status === 'FAIL');
  if (failures.length === 0) {
    console.log('[OK] System diagnostics healthy. Ready for local development & staging.');
  } else {
    console.log(`[WARN] ${failures.length} diagnostic failure(s) found. Check details above.`);
  }
  console.log('====================================================\n');
}

runDoctor().catch((err) => {
  console.error('Doctor diagnostics encountered an unexpected error:', err);
  process.exit(1);
});
