/**
 * 콘텐츠 데이터 접근 계층 (Data Access Layer)
 *
 * 1순위: 백엔드 API(/api/content) — 유튜브 자동 수집분을 포함한 전체 아카이브.
 * 2순위: 정적 스냅샷(archive.json) 폴백 — `npm run snapshot`으로 DB에서 내보낸
 *        파일이 번들에 포함되므로, 백엔드 없는 정적 배포(Vercel 등)에서도 전체
 *        아카이브가 보인다. (content.json은 시드용 원본 큐레이션 데이터)
 * UI 컴포넌트는 데이터 출처를 전혀 몰라도 되도록 async 인터페이스로 통일.
 */
import fallback from '../data/archive.json'
import famous from '../data/famousSwingMusic.json'

const JITTERBUG_RE = /\bjitterbug\b/i
const LINDY6_RE = /\b(6\s*-?\s*count|six\s+count|east\s+coast\s+swing)\b/i
const LINDY8_RE = /\b(8\s*-?\s*count|eight\s+count|swing\s*out)\b/i
const WCS_RE = /\bwest\s*coast\s*swing\b|\bwcs\b/i

/**
 * 기존 스냅샷의 'lindy' 태그를 신규 플레이리스트 체계로 호환 매핑한다.
 * - 과거 데이터는 대부분 lindy 단일 태그라 8-count로 기본 이관
 * - 제목 키워드가 있으면 jitterbug/6-count 태그를 추가
 * - 단, 제목에 West Coast Swing이 명시된 항목은 린디합이 아니라 별개 스타일이므로
 *   레거시 lindy 태그를 걷어내고 wcs로만 분류한다 (수집 초기엔 전용 검색어가 없어
 *   전부 lindy로 뭉뚱그려졌던 항목들)
 */
function normalizeStyles(item) {
  const next = new Set(item.styles)
  const text = `${item.title} ${item.artist}`

  if (WCS_RE.test(text)) {
    next.add('wcs')
    next.delete('lindy')
    return { ...item, styles: [...next] }
  }

  if (next.has('lindy')) {
    next.add('lindy8')
  }
  if (JITTERBUG_RE.test(text)) {
    next.add('jitterbug')
  }
  if (LINDY6_RE.test(text)) {
    next.add('lindy6')
  }
  if (LINDY8_RE.test(text)) {
    next.add('lindy8')
  }

  return { ...item, styles: [...next] }
}

/** 유명 스윙 음악 큐레이션을 기존 목록에 병합 (id 중복 시 큐레이션 우선) */
function mergeWithFamous(baseItems) {
  const map = new Map(baseItems.map((it) => [it.id, it]))
  for (const item of famous.items) {
    map.set(item.id, item)
  }
  return [...map.values()]
}

/**
 * 전체 콘텐츠 목록을 가져온다.
 * @returns {Promise<ContentItem[]>}
 *
 * @typedef {Object} ContentItem
 * @property {string}   id          - 고유 슬러그
 * @property {'music'|'video'|'tutorial'} type - 콘텐츠 타입
 * @property {string}   title
 * @property {string}   artist      - 아티스트/밴드/댄서 (자동 수집분은 채널명)
 * @property {string[]} styles      - 'jitterbug' | 'lindy6' | 'lindy8' | 'balboa' | 'charleston' | 'shag' | 'wcs' | 'lindy(legacy)'
 * @property {number|null} bpm      - 템포 (자동 수집분은 null — 측정 불가)
 * @property {number}   year        - 녹음/촬영/업로드 연도
 * @property {number}   durationSec - 길이(초)
 * @property {number}   popularity  - 0~100 인기 점수 (정렬용)
 * @property {string}   addedAt     - 아카이브 등록일 (ISO, '최신순' 정렬용)
 * @property {{platform:'youtube'|'spotify'|'soundcloud', id:string, url?:string, query?:string}} source
 * @property {string} [spotifyQuery] - 큐레이션 음악의 Spotify 검색어 (트랙 ID 없이도 "Spotify에서 열기" 링크 제공)
 */
export async function fetchContent() {
  try {
    const res = await fetch('/api/content', { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const { items } = await res.json()
    return mergeWithFamous(items).map(normalizeStyles)
  } catch {
    // 백엔드 미기동/정적 배포 — 번들에 포함된 큐레이션 데이터로 폴백
    return mergeWithFamous(fallback.items).map(normalizeStyles)
  }
}
