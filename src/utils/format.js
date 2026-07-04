/** 표시용 포맷터 & 소스(플랫폼)별 URL 생성 유틸 */

/** 초 → "3:07" 형태의 길이 문자열 */
export function formatDuration(sec) {
  if (!sec && sec !== 0) return '–:––'
  const m = Math.floor(sec / 60)
  const s = String(Math.round(sec % 60)).padStart(2, '0')
  return `${m}:${s}`
}

/**
 * 썸네일 URL. YouTube는 영상 ID로 공식 썸네일을 유도할 수 있고,
 * Spotify/SoundCloud는 API 없이 이미지를 얻을 수 없으므로 null을 반환해
 * 카드에서 아르데코 스타일 placeholder를 그리게 한다.
 */
export function getThumbnailUrl({ platform, id }) {
  if (platform === 'youtube') return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  return null
}

/** 임베드 플레이어 iframe src */
export function getEmbedUrl({ platform, id, url }) {
  switch (platform) {
    case 'youtube':
      // youtube-nocookie: 개인정보 보호 강화 도메인
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    case 'spotify':
      return `https://open.spotify.com/embed/track/${id}?theme=0`
    case 'soundcloud':
      // SoundCloud는 트랙 페이지 URL 전체를 넘겨야 함
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url ?? '')}&auto_play=true&color=%23c99a3f`
    default:
      return null
  }
}

/** 원본 페이지 링크 (새 탭으로 열기용) */
export function getSourceUrl({ platform, id, url }) {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${id}`
    case 'spotify':
      return `https://open.spotify.com/track/${id}`
    case 'soundcloud':
      return url ?? '#'
    default:
      return '#'
  }
}
