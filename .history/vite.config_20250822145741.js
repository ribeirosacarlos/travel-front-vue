import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // permite acessar do Windows
    port: 5173,
    strictPort: true,
  }
})
