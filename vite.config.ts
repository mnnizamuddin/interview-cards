import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** The project folder: the dev server may be started from its parent folder. */
const projectDir = fileURLToPath(new URL('.', import.meta.url));

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

/**
 * The short id of the commit being built: Vercel gives it in an environment variable; locally it
 * comes from git, and `dev` when neither is available.
 */
function buildCommit(): string {
  const fromVercel = process.env['VERCEL_GIT_COMMIT_SHA'];
  if (fromVercel) {
    return fromVercel.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: projectDir }).trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_COMMIT__: JSON.stringify(buildCommit()),
  },
  server: {
    port: 5180,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    // The on-disk module cache does not notice files added under an `import.meta.glob` pattern
    // (a new French overlay, a new card file), so tests could check stale content.
    fsModuleCache: false,
  },
});
