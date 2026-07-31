import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1';

const VALID_API_BASE_URL = /^(https?:\/\/[^\s'"`]+|\/[^\s'"`]*)$/;

// El .env es opcional y solo cubre el desarrollo local. loadEnvFile no sobrescribe lo que ya
// existe en el entorno, asi que la variable que pasa el despliegue o CI sigue teniendo prioridad.
try {
  process.loadEnvFile(resolve(import.meta.dirname, '../.env'));
} catch {
  // Sin .env se usa la variable de entorno o el valor por defecto.
}

const apiBaseUrl = (process.env.API_BASE_URL ?? '').trim() || DEFAULT_API_BASE_URL;

if (!VALID_API_BASE_URL.test(apiBaseUrl)) {
  console.error(
    `API_BASE_URL invalida: ${JSON.stringify(apiBaseUrl)}\n` +
      'Debe ser una URL http(s) o una ruta que empiece por /, sin espacios ni comillas.',
  );
  process.exit(1);
}

const withoutTrailingSlash = apiBaseUrl.replace(/\/+$/, '');

const target = resolve(import.meta.dirname, '../src/environments/environment.ts');

mkdirSync(dirname(target), { recursive: true });
writeFileSync(
  target,
  `// GENERADO por scripts/set-api-base-url.mjs. No editar ni versionar.
export const environment = {
  apiBaseUrl: '${withoutTrailingSlash}',
} as const;
`,
  'utf8',
);

console.log(`environment.ts generado con apiBaseUrl = ${withoutTrailingSlash}`);
