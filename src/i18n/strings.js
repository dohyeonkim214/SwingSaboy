/**
 * UI 문자열 사전 — 한국어(ko) / 영어(en).
 * 값이 함수인 항목은 동적 문자열 (예: t.openOn('YouTube')).
 * 브랜드 요소(Savoy Archive, 스타일명, EST◆1926 등)는 양쪽 다 영어 고정이라 여기 없다.
 */
export const STRINGS = {
  ko: {
    // Header
    tabArchive: '아카이브',
    tabPlaylist: '내 플레이리스트',
    tabsAria: '콘텐츠 탭',

    // FilterBar
    filterAria: '검색 및 필터',
    searchPlaceholder: '제목 또는 아티스트 검색…',
    sortAria: '정렬 기준',
    sortLatest: '최신순',
    sortPopular: '인기순',
    sortBpmAsc: 'BPM 낮은순',
    sortBpmDesc: 'BPM 높은순',
    typeMusic: '음악',
    typeVideo: '영상',
    typeTutorial: '튜토리얼',
    allEras: '전체 연대',
    resultsSuffix: '개의 콘텐츠',
    resetFilters: '필터 초기화 ✕',
    bpmMinAria: '최소 BPM',
    bpmMaxAria: '최대 BPM',

    // 카드 / 플레이어
    playAria: (title) => `${title} 재생`,
    addFavAria: '플레이리스트에 추가',
    removeFavAria: '플레이리스트에서 제거',
    playerAria: (title) => `${title} 플레이어`,
    close: '닫기',
    openOn: (platform) => `${platform}에서 열기 ↗`,

    // 빈 상태
    emptyTitle: '조건에 맞는 콘텐츠가 없습니다',
    emptyHint: '필터를 조금 풀거나 검색어를 바꿔보세요.',
    playlistEmptyTitle: '플레이리스트가 비어 있습니다',
    playlistEmptyHint: '카드의 ♡ 를 눌러 좋아하는 곡과 영상을 모아보세요.',
  },

  en: {
    // Header
    tabArchive: 'Archive',
    tabPlaylist: 'My Playlist',
    tabsAria: 'Content tabs',

    // FilterBar
    filterAria: 'Search and filters',
    searchPlaceholder: 'Search title or artist…',
    sortAria: 'Sort by',
    sortLatest: 'Newest',
    sortPopular: 'Most popular',
    sortBpmAsc: 'BPM: low to high',
    sortBpmDesc: 'BPM: high to low',
    typeMusic: 'Music',
    typeVideo: 'Video',
    typeTutorial: 'Tutorial',
    allEras: 'All eras',
    resultsSuffix: ' items',
    resetFilters: 'Reset filters ✕',
    bpmMinAria: 'Minimum BPM',
    bpmMaxAria: 'Maximum BPM',

    // Card / player
    playAria: (title) => `Play ${title}`,
    addFavAria: 'Add to playlist',
    removeFavAria: 'Remove from playlist',
    playerAria: (title) => `${title} player`,
    close: 'Close',
    openOn: (platform) => `Open on ${platform} ↗`,

    // Empty states
    emptyTitle: 'No content matches your filters',
    emptyHint: 'Try loosening the filters or changing your search.',
    playlistEmptyTitle: 'Your playlist is empty',
    playlistEmptyHint: 'Tap ♡ on a card to collect songs and clips you love.',
  },
}
