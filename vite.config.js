import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/anki-card-test-1/',
  build: {
    outDir: 'build' // Make sure the output directory aligns with what gh-pages expects
  },
  plugins: [react()],
});