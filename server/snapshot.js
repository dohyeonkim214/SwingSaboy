/**
 * 원커맨드 갱신: 유튜브 수집 1회 → 정적 스냅샷 내보내기 → 문서 역동기화.
 * Vercel 정적 배포 워크플로: npm run snapshot → git push → 자동 재배포.
 * 서버를 띄울 필요 없이 단독 실행된다 (.env의 YOUTUBE_API_KEY 사용).
 */
import { seedIfEmpty } from './seed.js'
import { collectAll } from './collector.js'
import { exportSnapshot } from './export.js'
import { syncDocs } from './docs-sync.js'

seedIfEmpty()
const summary = await collectAll()
if (!summary.ok) {
  console.warn(`[snapshot] 수집 건너뜀: ${summary.reason} — 기존 DB 내용만 내보냅니다`)
}
exportSnapshot()
syncDocs()
