import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Allow the current ngrok host so Vite accepts proxied requests.
    // Replace or add hosts as needed when the ngrok URL changes.
    allowedHosts: ['87a5afbb1c52.ngrok-free.app'],
    // Configure HMR to use secure websocket on the ngrok host.
    hmr: {
      protocol: 'wss',
      host: '87a5afbb1c52.ngrok-free.app',
    },
  },
})
