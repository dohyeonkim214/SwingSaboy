/**
 * 제공 API 서버 — 프론트엔드는 유튜브를 모른 채 이 API만 바라본다 (설계서 3장).
 *
 *   GET  /api/content  → { items: ContentItem[], updatedAt }  (프론트 계약)
 *   GET  /api/status   → 수집 상태·할당량 등 운영 정보
 *   POST /api/collect  → 수동 수집 트리거 (개발·테스트용)
 */
import express from 'express'
import { PORT, YOUTUBE_API_KEY } from './config.js'
import { listItems, countItems, getMeta, getQuotaUsedToday } from './db.js'
import { seedIfEmpty } from './seed.js'
import { startScheduler } from './scheduler.js'
import { collectAll } from './collector.js'

seedIfEmpty()

const app = express()

app.get('/api/content', (_req, res) => {
  res.json({
    items: listItems(),
    updatedAt: getMeta('lastCollectedAt'),
  })
})

app.get('/api/status', (_req, res) => {
  res.json({
    itemCount: countItems(),
    apiKeyConfigured: Boolean(YOUTUBE_API_KEY),
    lastCollectedAt: getMeta('lastCollectedAt'),
    lastCollectSummary: JSON.parse(getMeta('lastCollectSummary') ?? 'null'),
    quotaUsedToday: getQuotaUsedToday(),
  })
})

app.post('/api/collect', async (_req, res) => {
  const summary = await collectAll()
  res.status(summary.ok ? 200 : 409).json(summary)
})

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} — 항목 ${countItems()}건 서비스 중`)
  startScheduler()
})
