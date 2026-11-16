import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], include: ['src/**/*.test.{ts,tsx}'] },
  build: { chunkSizeWarningLimit: 1100, rollupOptions: { output: { manualChunks: {
    three: ['three'],
    charts: ['recharts'],
  } } } },
});
