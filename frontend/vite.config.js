import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Добавь для production build:
  build: {
    outDir: 'dist',
    sourcemap: false,  // Отключаем sourcemaps для production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,  // Упрощаем chunking
      },
    },
  },
})