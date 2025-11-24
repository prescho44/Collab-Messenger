import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
    // Dedupe React and React DOM to ensure a single instance is used
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Force Vite to pre-bundle emoji-picker-react to avoid runtime issues
    include: ['emoji-picker-react'],
  },
});
