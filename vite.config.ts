import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Относительные пути: собранную статику можно положить в любую подпапку хостинга.
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1024,
  },
});
