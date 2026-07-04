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

/**
 * 전체 콘텐츠 목록을 가져온다.
 * @returns {Promise<ContentItem[]>}
 *
 * @typedef {Object} ContentItem
 * @property {string}   id          - 고유 슬러그
 * @property {'music'|'video'|'tutorial'} type - 콘텐츠 타입
 * @property {string}   title
 * @property {string}   artist      - 아티스트/밴드/댄서 (자동 수집분은 채널명)
 * @property {string[]} styles      - 'lindy' | 'balboa' | 'charleston' | 'shag'
 * @property {number|null} bpm      - 템포 (자동 수집분은 null — 측정 불가)
 * @property {number}   year        - 녹음/촬영/업로드 연도
 * @property {number}   durationSec - 길이(초)
 * @property {number}   popularity  - 0~100 인기 점수 (정렬용)
 * @property {string}   addedAt     - 아카이브 등록일 (ISO, '최신순' 정렬용)
 * @property {{platform:'youtube'|'spotify'|'soundcloud', id:string, url?:string}} source
 */
export async function fetchContent() {
  try {
    const res = await fetch('/api/content', { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const { items } = await res.json()
    return items
  } catch {
    // 백엔드 미기동/정적 배포 — 번들에 포함된 큐레이션 데이터로 폴백
    return fallback.items
  }
}
