import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: fromRoot('index.html'),
        notFound: fromRoot('404.html'),
        privacy: fromRoot('privacy/index.html'),
        terms: fromRoot('terms/index.html')
      }
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**']
  }
});
