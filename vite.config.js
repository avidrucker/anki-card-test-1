import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/anki-card-test-1/',
  build: {
    outDir: 'build',  // Default and generally recommended setting
    assetsDir: 'assets'
  },
  publicDir: 'public',
  plugins: [react()],
});