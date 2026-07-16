import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

const uni = uniModule.default || uniModule
const siteOrigin = (process.env.MALL_SITE_ORIGIN || 'https://mall.leedu.ac.cn').replace(/\/$/, '')

export default defineConfig({
  plugins: [uni()],
  define: {
    __MALL_SITE_ORIGIN__: JSON.stringify(siteOrigin)
  },
  server: {
    host: '127.0.0.1',
    cors: false,
    proxy: {
      '/api': {
        target: siteOrigin,
        changeOrigin: true,
        secure: true
      }
    }
  }
})
