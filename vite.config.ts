import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'zustand'],
          reactflow: ['reactflow'],
          icons: ['lucide-react']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
