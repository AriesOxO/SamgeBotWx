import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 定义环境变量默认值
  define: {
    __VITE_API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: '0.0.0.0',
    // 代理配置，将API请求转发到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 生产环境移除console
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
