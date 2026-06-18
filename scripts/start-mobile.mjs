#!/usr/bin/env node
/**
 * Inicia o Expo com EXPO_PUBLIC_API_URL apontando para o backend local na rede.
 * Evita o fallback 10.0.2.2 (válido só no emulador Android).
 */
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const mobileDir = path.resolve(projectRoot, 'frontend-mobile');

dotenv.config({ path: path.join(projectRoot, '.env') });
const apiPort = process.env.PORT || '3000';

const getLanIp = () => {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
};

const lanIp = getLanIp();
const apiUrl = process.env.EXPO_PUBLIC_API_URL || `http://${lanIp}:${apiPort}`;

console.log(`[Mobile] API: ${apiUrl}`);
if (apiUrl.includes('azurewebsites.net')) {
  console.log('[Mobile] Usando backend de produção (mesmos dados do web).');
} else {
  console.log('[Mobile] Backend local — para dados iguais ao web, use EXPO_PUBLIC_API_URL=https://checarapp.azurewebsites.net no .env');
}

const env = {
  ...process.env,
  EXPO_PUBLIC_API_URL: apiUrl,
};

const expoCli = path.join(mobileDir, 'node_modules', 'expo', 'bin', 'cli');
const extraArgs = process.argv.slice(2);

const child = spawn(process.execPath, [expoCli, 'start', ...extraArgs], {
  cwd: mobileDir,
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
