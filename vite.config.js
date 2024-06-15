import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/anki-card-test-1/',
  build: {
    outDir: 'build', // Make sure the output directory aligns with what gh-pages expects
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: 'src/assets',
  plugins: [react()],
});