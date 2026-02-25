import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Lavage Vida ERP',
        short_name: 'Vida POS',
        description: 'Lavage Vida ERP & Point of Sale System',
        theme_color: '#1a1f2c',
        background_color: '#0f131a',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  // Set clearScreen to false to prevent Vite from obscuring Rust errors
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_ENV_'],
})
