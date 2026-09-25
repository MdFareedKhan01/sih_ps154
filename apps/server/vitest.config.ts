import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Tests run from apps/server, but the variables live in the root .env.
// .env.example fills anything .env lacks, so tests also run on CI, where there is no .env.
const root = (file: string) => fileURLToPath(new URL(`../../${file}`, import.meta.url));
config({ path: [root('.env'), root('.env.example')], quiet: true });

export default defineConfig({
  test: { include: ['test/**/*.test.ts'] },
});
