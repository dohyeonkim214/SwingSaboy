/**
 * 카탈로그 메타데이터 — 스타일/타입/플랫폼/정렬 옵션의 단일 소스.
 * 새 스타일이나 플랫폼을 추가할 때 여기만 수정하면 필터 UI에 자동 반영된다.
 */

/** 댄스 스타일 태그 */
export const STYLES = [
  { id: 'lindy', label: 'Lindy Hop' },
  { id: 'balboa', label: 'Balboa' },
  { id: 'charleston', label: 'Charleston' },
  { id: 'shag', label: 'Collegiate Shag' },
]

/** 콘텐츠 타입 — labelKey는 i18n/strings.js의 키 (렌더 시 t[labelKey]로 번역) */
export const TYPES = [
  { id: 'music', labelKey: 'typeMusic', icon: '♪' },
  { id: 'video', labelKey: 'typeVideo', icon: '▸' },
  { id: 'tutorial', labelKey: 'typeTutorial', icon: '✎' },
]

/** 출처 플랫폼 표시용 메타 */
export const PLATFORMS = {
  youtube: { label: 'YouTube', badgeClass: 'text-red-400' },
  spotify: { label: 'Spotify', badgeClass: 'text-green-400' },
  soundcloud: { label: 'SoundCloud', badgeClass: 'text-orange-400' },
}

/** 정렬 옵션 — value는 useContentFilters의 정렬 분기 키, labelKey는 i18n 키 */
export const SORT_OPTIONS = [
  { value: 'latest', labelKey: 'sortLatest' },
  { value: 'popular', labelKey: 'sortPopular' },
  { value: 'bpm-asc', labelKey: 'sortBpmAsc' },
  { value: 'bpm-desc', labelKey: 'sortBpmDesc' },
]

/** BPM 슬라이더 범위 (찰스턴은 300 가까이 가므로 넉넉하게) */
export const BPM_MIN = 100
export const BPM_MAX = 300
