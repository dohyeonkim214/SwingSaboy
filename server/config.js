/**
 * 백엔드 설정 — 환경변수 로드 + 수집 엔진 상수의 단일 소스.
 * 검색어를 바꾸거나 스타일을 추가할 때 여기만 수정하면 된다.
 */

// .env가 없어도(키를 아직 안 받은 상태) 서버는 떠야 하므로 조용히 넘어간다
try {
  process.loadEnvFile()
} catch {
  /* .env 없음 — 환경변수로 직접 주입했거나 시드 데이터만 사용하는 상태 */
}

export const PORT = Number(process.env.PORT ?? 3001)
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? ''

/** 수집 주기 (시간). 유튜브 할당량은 PDT 자정 리셋이므로 24h면 충분히 안전 */
export const COLLECT_INTERVAL_HOURS = Number(process.env.COLLECT_INTERVAL_HOURS ?? 24)

/**
 * 스타일별 유튜브 검색어 — 프론트엔드 catalog.js의 스타일 id와 반드시 일치해야 한다.
 * search.list는 1회 100유닛. 총 21개 검색어 × 100 = 회당 약 2,100유닛으로
 * 검색당 최대 50개 → 원본 ~1,000개(중복 제거 전)를 수집한다.
 * 같은 영상이 여러 검색에 걸리면 DB에서 스타일 합집합으로 병합되므로 중복 걱정 없음.
 */
export const STYLE_QUERIES = [
  {
    styleId: 'lindy',
    queries: [
      'lindy hop dance',
      'lindy hop competition',
      'lindy hop social dance',
      'lindy hop performance showcase',
      'lindy hop tutorial',
      'savoy style lindy hop',
      'frankie manning lindy hop',
    ],
  },
  {
    styleId: 'balboa',
    queries: [
      'balboa swing dance',
      'balboa dance competition',
      'balboa dance tutorial',
      'pure balboa dance',
      'bal-swing dance',
    ],
  },
  {
    styleId: 'charleston',
    queries: [
      'solo charleston swing dance',
      'charleston dance 1920s',
      'solo jazz charleston routine',
      'partner charleston swing',
      'charleston dance tutorial',
    ],
  },
  {
    styleId: 'shag',
    queries: [
      'collegiate shag dance',
      'collegiate shag competition',
      'collegiate shag tutorial',
      'st louis shag dance',
    ],
  },
]

/** search.list 1회당 가져올 결과 수 (API 최대 50, 할당량은 개수와 무관하게 100유닛) */
export const SEARCH_MAX_RESULTS = 50

/** 검색어당 페이지 수 — 2로 올리면 검색어당 최대 100개(할당량 2배). 기본 1 */
export const SEARCH_PAGES_PER_QUERY = Number(process.env.SEARCH_PAGES_PER_QUERY ?? 1)

/** 이 길이(초) 미만 영상은 쇼츠/잡음으로 보고 버린다 */
export const MIN_DURATION_SEC = 45

/** 일일 할당량 상한 — 이 이상 쓰면 그날 수집을 중단한다 (기본 10,000의 절반만 사용) */
export const DAILY_QUOTA_BUDGET = Number(process.env.DAILY_QUOTA_BUDGET ?? 5000)

/** 메서드별 할당량 비용 (설계서 2.1) */
export const QUOTA_COST = { search: 100, videos: 1 }
