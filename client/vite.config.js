import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // When served under /chatbot on production, all assets resolve correctly
  base: mode === 'production' ? '/chatbot/' : '/',

  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/widget.js': { target: 'http://localhost:3001', changeOrigin: true },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}))
