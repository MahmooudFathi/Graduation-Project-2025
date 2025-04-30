// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://graduation.amiralsayed.me',
        changeOrigin: true,
        secure: false, // 👈 تجاهل مشاكل الشهادة في dev
      },
    },
  },
})
