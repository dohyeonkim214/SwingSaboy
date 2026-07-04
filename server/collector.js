/**
 * 수집기 — 스타일별 검색 → 상세 조회 → ContentItem으로 가공 → DB upsert.
 * 할당량 예산(DAILY_QUOTA_BUDGET)을 넘기면 그날 수집을 중단한다.
 */
import {
  STYLE_QUERIES,
  SEARCH_PAGES_PER_QUERY,
  MIN_DURATION_SEC,
  DAILY_QUOTA_BUDGET,
  QUOTA_COST,
  YOUTUBE_API_KEY,
} from './config.js'
import { searchVideoIds, fetchVideoDetails, QuotaExceededError } from './youtube.js'
import { upsertItem, setMeta, getQuotaUsedToday, addQuotaUsed } from './db.js'

/** 제목으로 튜토리얼 여부 추정 — 유튜브 API에는 이 구분이 없다 */
const TUTORIAL_RE =
  /tutorial|lesson|class|how to|beginner|basics|footwork|technique|강습|강좌|레슨|배우기|기초|입문/i

/** 조회수 → 0~100 인기 점수 (로그 스케일: 1천만 뷰 ≈ 100점) */
function popularityOf(viewCount) {
  return Math.min(100, Math.round((Math.log10(viewCount + 1) / 7) * 100))
}

/** 유튜브 영상 상세 → 프론트엔드 ContentItem */
function toContentItem(video, styleId) {
  return {
    id: `yt-${video.id}`,
    type: TUTORIAL_RE.test(video.title) ? 'tutorial' : 'video',
    title: video.title,
    artist: video.channelTitle,
    styles: [styleId],
    bpm: null, // 자동 수집분은 BPM을 알 수 없음 — 프론트에서 null 허용
    year: new Date(video.publishedAt).getFullYear(),
    durationSec: video.durationSec,
    popularity: popularityOf(video.viewCount),
    addedAt: new Date().toISOString().slice(0, 10),
    source: { platform: 'youtube', id: video.id },
    viewCount: video.viewCount,
    curated: false,
  }
}

/** 동시 실행 방지 — 스케줄러와 수동 트리거(POST /api/collect)가 겹치면 할당량 이중 소모 */
let running = false

/**
 * 전체 스타일 1회 수집. 결과 요약을 반환한다.
 * API 키가 없거나 예산이 소진되면 아무것도 하지 않는다.
 */
export async function collectAll() {
  if (!YOUTUBE_API_KEY) {
    return { ok: false, reason: 'YOUTUBE_API_KEY 미설정 — .env에 키를 추가하세요' }
  }
  if (running) {
    return { ok: false, reason: '이미 수집이 진행 중입니다' }
  }
  running = true
  try {
    return await runCollection()
  } finally {
    running = false
  }
}

async function runCollection() {

  const summary = { ok: true, collected: 0, skipped: 0, quotaUsed: 0, styles: {} }

  /** 예산 확인 — 초과 시 summary에 기록하고 false */
  const hasBudget = (cost) => {
    if (getQuotaUsedToday() + cost <= DAILY_QUOTA_BUDGET) return true
    summary.stoppedEarly ??= `할당량 예산(${DAILY_QUOTA_BUDGET}유닛) 도달 — 이후 수집 중단`
    return false
  }

  outer: for (const { styleId, queries } of STYLE_QUERIES) {
    try {
      // 1) 이 스타일의 모든 검색어를 돌며 videoId를 모은다 (Set으로 검색 간 중복 제거)
      const idSet = new Set()
      for (const query of queries) {
        let pageToken
        for (let page = 0; page < SEARCH_PAGES_PER_QUERY; page++) {
          if (!hasBudget(QUOTA_COST.search)) break outer
          const { ids, nextPageToken } = await searchVideoIds(query, pageToken)
          addQuotaUsed(QUOTA_COST.search)
          summary.quotaUsed += QUOTA_COST.search
          for (const id of ids) idSet.add(id)
          pageToken = nextPageToken
          if (!pageToken) break
        }
      }

      // 2) 상세 조회는 50개 묶음당 1유닛 — 검색에 비하면 공짜 수준
      const detailCost = Math.ceil(idSet.size / 50) * QUOTA_COST.videos
      if (!hasBudget(detailCost)) break
      const { videos, apiCalls } = await fetchVideoDetails([...idSet])
      addQuotaUsed(apiCalls * QUOTA_COST.videos)
      summary.quotaUsed += apiCalls * QUOTA_COST.videos

      // 3) 가공 후 저장
      let collected = 0
      for (const video of videos) {
        if (video.durationSec < MIN_DURATION_SEC) {
          summary.skipped++
          continue
        }
        upsertItem(toContentItem(video, styleId))
        collected++
      }
      summary.collected += collected
      summary.styles[styleId] = collected
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        summary.stoppedEarly = err.message
        break
      }
      // 한 스타일 실패가 나머지 수집을 막지 않도록 기록만 하고 계속
      summary.styles[styleId] = `실패: ${err.message}`
      console.error(`[collector] ${styleId} 수집 실패:`, err.message)
    }
  }

  setMeta('lastCollectedAt', new Date().toISOString())
  setMeta('lastCollectSummary', JSON.stringify(summary))
  console.log('[collector] 수집 완료:', JSON.stringify(summary))
  return summary
}
