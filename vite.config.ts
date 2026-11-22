import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Multi-page build with root-level HTML files:
// /index.html, /start.html, /dashboard.html, /safety/index.html
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        start: resolve(__dirname, 'start.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        safety: resolve(__dirname, 'safety/index.html'),
      },
    },
  },
})
