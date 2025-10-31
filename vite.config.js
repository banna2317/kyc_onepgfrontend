import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'vite-plugin-vue-inspector'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),Inspector()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
