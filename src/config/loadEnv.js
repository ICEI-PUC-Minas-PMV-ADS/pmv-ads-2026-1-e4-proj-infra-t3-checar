import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Raiz do repositório (independente do cwd ao rodar npm start). */
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const envPath = path.join(PROJECT_ROOT, '.env');

if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('[Env] Falha ao carregar .env:', result.error.message);
  }
} else {
  dotenv.config();
}
