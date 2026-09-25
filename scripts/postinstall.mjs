// Regenerates the Prisma client after every `npm install`, once prisma/schema.prisma exists.
// Before B writes the schema (Guide B, Step 2) there is nothing to generate, so this is a no-op.
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (existsSync('prisma/schema.prisma')) {
  execSync('npx prisma generate', { stdio: 'inherit' });
}
