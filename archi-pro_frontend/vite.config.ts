import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_PROXY_TARGET?.trim() || 'https://192.168.1.139:3000'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      https: {
        key: fs.readFileSync('certs/key.pem'),
        cert: fs.readFileSync('certs/cert.pem'),
      },
      proxy: {
        '/auth': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/projects': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/statistics': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/user': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/logging': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/chat': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        // Proxy socket.io websocket connections through Vite dev server
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  }
})
