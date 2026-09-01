import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const packageVersion = (JSON.parse(readFileSync(fromRoot('package.json'), 'utf8')) as { version: string }).version;

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion)
  },
  plugins: [{
    name: 'cuebook-version',
    transformIndexHtml: (html) => html.replaceAll('__APP_VERSION__', packageVersion)
  }],
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
