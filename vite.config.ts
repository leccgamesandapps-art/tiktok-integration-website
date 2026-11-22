import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Multi-page build: each product page is a real URL (/, /start, /dashboard, /safety)
// and sections inside a page are addressed with the URL hash.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        start: resolve(__dirname, 'start/index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        safety: resolve(__dirname, 'safety/index.html'),
      },
    },
  },
})
