import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 默认前端端口可能是 5173
    port: 5173,
    proxy: {
      // 告诉 Vite：所有以 /api 开头的请求，都帮我转发给 localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 关键：不要 rewrite，因为你的后端 server.js 里定义的路由就是 /api/gemini/generate
      }
    }
  }
})