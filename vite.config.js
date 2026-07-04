import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 정적 사이트 빌드 — 백엔드 없이 `npm run build` 결과물(dist/)을 그대로 배포 가능
// Tailwind v4 — 디자인 토큰은 src/index.css의 @theme 블록에 정의
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 개발 중 /api 요청을 백엔드(server/index.js)로 전달 — CORS 설정 불필요
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
