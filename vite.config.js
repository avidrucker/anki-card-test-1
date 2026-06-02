import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Watches public/*.json and triggers a full browser reload when any theme
// JSON changes (e.g. after running node scripts/generate-themes.mjs).
// Vite's default watcher covers src/ but ignores the static public/ folder.
const watchPublicJson = {
  name: 'watch-public-json',
  configureServer(server) {
    server.watcher.add('public/*.json');
    server.watcher.on('change', (path) => {
      if (path.includes('/public/') && path.endsWith('.json')) {
        server.ws.send({ type: 'full-reload' });
      }
    });
  },
};

export default defineConfig({
  base: '/anki-card-test-1/',
  build: {
    outDir: 'build',
    assetsDir: 'assets'
  },
  publicDir: 'public',
  plugins: [react(), watchPublicJson],
  test: {
    environment: 'node',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});