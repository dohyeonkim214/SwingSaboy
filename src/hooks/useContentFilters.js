import { useMemo, useState } from 'react'
import { BPM_MIN, BPM_MAX } from '../constants/catalog'

/** 필터 초기값 */
const INITIAL_FILTERS = {
  query: '',            // 제목·아티스트 텍스트 검색
  styles: [],           // 선택된 스타일 id 배열 (빈 배열 = 전체)
  types: [],            // 선택된 콘텐츠 타입 (빈 배열 = 전체)
  decade: 'all',        // 'all' 또는 1920, 1930, ... (연대 필터)
  bpmRange: [BPM_MIN, BPM_MAX],
}

/** 배열 안 토글 헬퍼: 있으면 빼고 없으면 넣는다 */
function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

/**
 * 필터 + 검색 + 정렬 상태와 그 결과 목록을 관리하는 훅.
 * items는 원본 그대로 두고 useMemo로 파생 목록만 계산한다 (실시간 필터링).
 */
export function useContentFilters(items) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState('latest')

  /** 개별 필터 업데이트 액션들 */
  const actions = {
    setQuery: (query) => setFilters((f) => ({ ...f, query })),
    toggleStyle: (id) => setFilters((f) => ({ ...f, styles: toggleInArray(f.styles, id) })),
    toggleType: (id) => setFilters((f) => ({ ...f, types: toggleInArray(f.types, id) })),
    setDecade: (decade) => setFilters((f) => ({ ...f, decade })),
    setBpmRange: (bpmRange) => setFilters((f) => ({ ...f, bpmRange })),
    reset: () => setFilters(INITIAL_FILTERS),
  }

  /** 데이터에 실제로 존재하는 연대만 드롭다운에 노출 */
  const decades = useMemo(() => {
    const set = new Set(items.map((it) => Math.floor(it.year / 10) * 10))
    return [...set].sort((a, b) => a - b)
  }, [items])

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const [bpmLo, bpmHi] = filters.bpmRange
    // 슬라이더가 기본(전체) 범위면 BPM 미상(null, 자동 수집분) 항목도 보여주고,
    // 유저가 범위를 좁히면 BPM을 아는 항목만 대상으로 필터링한다
    const bpmActive = bpmLo !== BPM_MIN || bpmHi !== BPM_MAX

    const filtered = items.filter((it) => {
      if (q && !`${it.title} ${it.artist}`.toLowerCase().includes(q)) return false
      if (filters.styles.length && !it.styles.some((s) => filters.styles.includes(s))) return false
      if (filters.types.length && !filters.types.includes(it.type)) return false
      if (filters.decade !== 'all' && Math.floor(it.year / 10) * 10 !== filters.decade) return false
      if (bpmActive && (it.bpm == null || it.bpm < bpmLo || it.bpm > bpmHi)) return false
      return true
    })

    // 정렬은 사본에서 수행 (원본 불변)
    const sorted = [...filtered]
    switch (sortBy) {
      case 'bpm-asc':
        // BPM 미상 항목은 항상 뒤로
        sorted.sort((a, b) => (a.bpm ?? Number.MAX_SAFE_INTEGER) - (b.bpm ?? Number.MAX_SAFE_INTEGER))
        break
      case 'bpm-desc':
        sorted.sort((a, b) => (b.bpm ?? -1) - (a.bpm ?? -1))
        break
      case 'popular':
        sorted.sort((a, b) => b.popularity - a.popularity)
        break
      case 'latest':
      default:
        sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    }
    return sorted
  }, [items, filters, sortBy])

  /** 초기 상태에서 하나라도 바뀌었는지 — '필터 초기화' 버튼 노출용 */
  const isDirty =
    filters.query !== '' ||
    filters.styles.length > 0 ||
    filters.types.length > 0 ||
    filters.decade !== 'all' ||
    filters.bpmRange[0] !== BPM_MIN ||
    filters.bpmRange[1] !== BPM_MAX

  return { filters, actions, sortBy, setSortBy, results, decades, isDirty }
}
