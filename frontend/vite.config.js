import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // 设置 @ 指向 src 目录
    }
  },
  server: {
    port: 5175, // 设置固定端口号
    strictPort: true, // 如果端口被占用，则直接退出
    open: true // 启动时自动打开浏览器
  }
})
