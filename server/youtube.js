/**
 * 유튜브 Data API v3 클라이언트 — fetch 기반, SDK 의존성 없음.
 * 할당량 비용: search.list 100유닛, videos.list 1유닛 (설계서 2.1)
 */
import { YOUTUBE_API_KEY, SEARCH_MAX_RESULTS } from './config.js'

const BASE = 'https://www.googleapis.com/youtube/v3'

/** 할당량 초과(403 quotaExceeded)를 다른 오류와 구분하기 위한 전용 에러 */
export class QuotaExceededError extends Error {
  constructor() {
    super('YouTube API 일일 할당량 초과 (PDT 자정에 리셋)')
    this.name = 'QuotaExceededError'
  }
}

async function call(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('key', YOUTUBE_API_KEY)

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const reason = body?.error?.errors?.[0]?.reason
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      throw new QuotaExceededError()
    }
    throw new Error(`YouTube API ${endpoint} 실패 (${res.status}): ${body?.error?.message ?? res.statusText}`)
  }
  return res.json()
}

/**
 * 키워드 검색 (100유닛). 임베드 가능한 영상만.
 * @param {string} query
 * @param {string} [pageToken] - 다음 페이지 토큰 (페이지네이션)
 * @returns {Promise<{ids: string[], nextPageToken: string|null}>}
 */
export async function searchVideoIds(query, pageToken) {
  const data = await call('search', {
    part: 'id',
    q: query,
    type: 'video',
    videoEmbeddable: 'true',
    maxResults: String(SEARCH_MAX_RESULTS),
    order: 'relevance',
    safeSearch: 'none',
    ...(pageToken ? { pageToken } : {}),
  })
  return {
    ids: (data.items ?? []).map((it) => it.id.videoId).filter(Boolean),
    nextPageToken: data.nextPageToken ?? null,
  }
}

/**
 * 영상 상세 조회 — 50개씩 끊어 호출 (호출 1회 = 1유닛).
 * @returns {Promise<{videos: Array<{id, title, channelTitle, publishedAt, durationSec, viewCount}>, apiCalls: number}>}
 */
export async function fetchVideoDetails(videoIds) {
  const videos = []
  let apiCalls = 0
  for (let i = 0; i < videoIds.length; i += 50) {
    const data = await call('videos', {
      part: 'snippet,contentDetails,statistics',
      id: videoIds.slice(i, i + 50).join(','),
    })
    apiCalls++
    for (const v of data.items ?? []) {
      videos.push({
        id: v.id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
        durationSec: parseIsoDuration(v.contentDetails.duration),
        viewCount: Number(v.statistics?.viewCount ?? 0),
      })
    }
  }
  return { videos, apiCalls }
}

/** ISO 8601 기간(PT1H2M3S) → 초 */
export function parseIsoDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? '')
  if (!m) return 0
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
}
