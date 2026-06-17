#!/usr/bin/env node
/**
 * Valida service account Firebase e gera valor para FIREBASE_SERVICE_ACCOUNT_JSON.
 * Uso: node scripts/prepare-firebase-env.mjs caminho/para/service-account.json
 *
 * NÃO commitar os arquivos gerados (.firebase-env.*).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert } from 'firebase-admin/app';

const PEM_BEGIN = '-----BEGIN PRIVATE KEY-----';
const PEM_END = '-----END PRIVATE KEY-----';

const fixPrivateKey = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;

  let key = raw.trim();
  key = key.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  key = key.replace(/\r/g, '');

  if (!key.includes(PEM_BEGIN) || !key.includes(PEM_END)) return key;

  const start = key.indexOf(PEM_BEGIN) + PEM_BEGIN.length;
  const stop = key.indexOf(PEM_END);
  const body = key.slice(start, stop).replace(/\s+/g, '');
  if (!body) return key;

  const lines = body.match(/.{1,64}/g) ?? [body];
  return `${PEM_BEGIN}\n${lines.join('\n')}\n${PEM_END}\n`;
};

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node scripts/prepare-firebase-env.mjs caminho/para/service-account.json');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(resolve(filePath), 'utf8'));
} catch {
  console.error('ERRO: não foi possível ler/parsear o arquivo JSON.');
  process.exit(1);
}

if (serviceAccount?.type !== 'service_account' || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('ERRO: arquivo não parece uma Firebase service account válida.');
  process.exit(1);
}

serviceAccount.private_key = fixPrivateKey(serviceAccount.private_key);

try {
  cert(serviceAccount);
} catch (err) {
  console.error('ERRO: private_key inválida:', err.message);
  console.error('Baixe uma nova chave em Firebase Console → Service accounts.');
  process.exit(1);
}

const minified = JSON.stringify(serviceAccount);
const base64 = Buffer.from(minified, 'utf8').toString('base64');

writeFileSync('.firebase-env.min.json', minified, 'utf8');
writeFileSync('.firebase-env.b64.txt', base64, 'utf8');

console.log('OK: chave aceita pelo Firebase Admin SDK');
console.log('client_email:', serviceAccount.client_email);
console.log('');
console.log('Arquivos gerados (NÃO commitar):');
console.log('  .firebase-env.min.json  → JSON minificado');
console.log('  .firebase-env.b64.txt   → base64 (recomendado para Azure)');
console.log('');
console.log('Azure App Service → Configuration → FIREBASE_SERVICE_ACCOUNT_JSON');
console.log('Cole o conteúdo de .firebase-env.b64.txt → Save → Restart');
console.log('Confira: GET /health → "firebase": true');
