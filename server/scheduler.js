/**
 * 배치 스케줄러 — COLLECT_INTERVAL_HOURS(기본 24h)마다 수집을 실행한다.
 * cron 라이브러리 대신 단순 인터벌 + 마지막 실행 시각(DB meta) 비교 방식:
 * 서버가 재시작돼도 마지막 수집이 최신이면 중복 실행하지 않는다.
 */
import { COLLECT_INTERVAL_HOURS, YOUTUBE_API_KEY } from './config.js'
import { getMeta } from './db.js'
import { collectAll } from './collector.js'

const CHECK_EVERY_MS = 15 * 60 * 1000 // 15분마다 실행 시점인지 확인

function isDue() {
  const last = getMeta('lastCollectedAt')
  if (!last) return true
  return Date.now() - Date.parse(last) >= COLLECT_INTERVAL_HOURS * 3600 * 1000
}

async function tick() {
  if (!isDue()) return
  try {
    await collectAll()
  } catch (err) {
    console.error('[scheduler] 수집 중 오류:', err)
  }
}

export function startScheduler() {
  if (!YOUTUBE_API_KEY) {
    console.log('[scheduler] YOUTUBE_API_KEY 미설정 — 스케줄러 대기 (키 추가 후 서버 재시작)')
    return
  }
  console.log(`[scheduler] ${COLLECT_INTERVAL_HOURS}시간 주기 수집 스케줄러 시작`)
  tick() // 기동 직후 밀린 수집이 있으면 바로 실행
  setInterval(tick, CHECK_EVERY_MS)
}
