import { spawn, execSync } from 'child_process';
import * as net from 'net';
import * as path from 'path';

/**
 * CampusFlow Unified One-Command Launcher
 * Automates pre-flight checks, port conflict resolution, Docker DB verification,
 * and launches all monorepo services in a single unified terminal session.
 */

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(prefix: string, message: string, color = ANSI.cyan) {
  console.log(`${color}${ANSI.bold}[${prefix}]${ANSI.reset} ${message}`);
}

async function isPortOpen(port: number, host = '127.0.0.1', timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
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
    socket.connect(port, host);
  });
}

function freePortWindows(port: number) {
  try {
    const cmd = `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique"`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (output) {
      const pids = output.split(/\r?\n/).map((p) => p.trim()).filter((p) => p && p !== '0');
      for (const pid of pids) {
        log('CLEANUP', `Terminating stale process on port ${port} (PID: ${pid})...`, ANSI.yellow);
        execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`, {
          stdio: 'ignore',
        });
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

async function preflightChecks() {
  console.log(`${ANSI.blue}${ANSI.bold}====================================================${ANSI.reset}`);
  console.log(`${ANSI.blue}${ANSI.bold}CampusFlow - One-Command Full Stack Launcher${ANSI.reset}`);
  console.log(`${ANSI.gray}Institution: Haramaya University Pilot MVP · Ethiopian Higher Ed${ANSI.reset}`);
  console.log(`${ANSI.blue}${ANSI.bold}====================================================${ANSI.reset}\n`);

  // 1. Resolve stale port collisions on 3000 (Web) and 4000 (API)
  if (process.platform === 'win32') {
    log('PREFLIGHT', 'Checking port availability (3000, 4000)...');
    freePortWindows(3000);
    freePortWindows(4000);
  }

  // 2. Check Database (Port 5432)
  log('PREFLIGHT', 'Verifying PostgreSQL database connection on port 5432...');
  const dbConnected = await isPortOpen(5432);
  if (!dbConnected) {
    log('DATABASE', 'PostgreSQL not responding on port 5432. Attempting docker compose up -d...', ANSI.yellow);
    try {
      execSync('docker compose up -d postgres', { stdio: 'inherit' });
      // Wait up to 3 seconds for port to open
      let retries = 6;
      while (retries > 0) {
        await new Promise((r) => setTimeout(r, 500));
        if (await isPortOpen(5432)) {
          break;
        }
        retries--;
      }
    } catch {
      log('DATABASE', 'Could not auto-start Docker container. Ensure PostgreSQL is active.', ANSI.yellow);
    }
  } else {
    log('DATABASE', 'PostgreSQL is active and accepting connections.', ANSI.green);
  }

  // 3. Print service endpoints
  console.log(`\n${ANSI.bold}Services will be accessible at:${ANSI.reset}`);
  console.log(`  - Web Application:       ${ANSI.cyan}http://localhost:3000${ANSI.reset}`);
  console.log(`  - Backend REST API:      ${ANSI.cyan}http://localhost:4000/api/v1${ANSI.reset}`);
  console.log(`  - Swagger Documentation: ${ANSI.cyan}http://localhost:4000/api/docs${ANSI.reset}`);
  console.log(`\n${ANSI.bold}Test Credentials:${ANSI.reset}`);
  console.log(`  - Student:  ${ANSI.yellow}student@haramaya.edu.et${ANSI.reset}  /  ${ANSI.yellow}password123${ANSI.reset}`);
  console.log(`  - Merchant: ${ANSI.yellow}merchant@haramayacafe.et${ANSI.reset} /  ${ANSI.yellow}password123${ANSI.reset}`);
  console.log(`  - Admin:    ${ANSI.yellow}admin@campusflow.et${ANSI.reset}      /  ${ANSI.yellow}password123${ANSI.reset}\n`);
}

async function main() {
  await preflightChecks();

  const includeMobile = process.argv.includes('--mobile');

  log('TURBO', 'Starting dev servers across monorepo packages (API + Web + Contracts)...', ANSI.blue);

  const isWindows = process.platform === 'win32';
  const turboCmd = isWindows ? 'npx.cmd' : 'npx';

  const child = spawn(turboCmd, ['turbo', 'run', 'dev'], {
    stdio: 'inherit',
    shell: isWindows,
  });

  let mobileChild: ReturnType<typeof spawn> | null = null;
  if (includeMobile) {
    log('MOBILE', 'Launching Flutter web client on Chrome (apps/mobile)...', ANSI.magenta);
    const flutterCmd = isWindows ? 'flutter.bat' : 'flutter';
    mobileChild = spawn(flutterCmd, ['run', '-d', 'chrome'], {
      cwd: path.resolve(__dirname, '../apps/mobile'),
      stdio: 'inherit',
      shell: isWindows,
    });
  }

  const cleanup = () => {
    log('SHUTDOWN', 'Stopping all services...', ANSI.yellow);
    if (child) child.kill();
    if (mobileChild) mobileChild.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log('ERROR', `Process exited with code ${code}`, ANSI.red);
    }
    if (mobileChild) mobileChild.kill();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('Launcher failed:', err);
  process.exit(1);
});
