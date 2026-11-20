import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/register': 'http://localhost:5001',
      '/login': 'http://localhost:5001',
    },
  },
});
