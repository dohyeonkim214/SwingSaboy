import { useEffect, useMemo, useState } from 'react'
import { fetchContent } from './services/contentService'
import { useFavorites } from './hooks/useFavorites'
import { useContentFilters } from './hooks/useContentFilters'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ContentGrid from './components/ContentGrid'
import PlayerModal from './components/PlayerModal'
import EmptyState from './components/EmptyState'

/**
 * 앱 루트 — 데이터 로드, 탭(전체/플레이리스트) 전환, 플레이어 모달 상태를 관리하고
 * 필터링·정렬 로직은 useContentFilters 훅에 위임한다.
 */
export default function App() {
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('all') // 'all' | 'favorites'
  const [playing, setPlaying] = useState(null) // 모달에서 재생 중인 항목

  const { favoriteIds, toggleFavorite } = useFavorites()
  const { filters, actions, sortBy, setSortBy, results, decades, isDirty } =
    useContentFilters(items)

  // 마운트 시 콘텐츠 로드 (contentService가 API로 바뀌어도 이 코드는 그대로)
  useEffect(() => {
    fetchContent().then(setItems)
  }, [])

  // 탭에 따라 필터 결과에서 즐겨찾기만 추려낸다
  const visible = useMemo(
    () => (tab === 'favorites' ? results.filter((it) => favoriteIds.has(it.id)) : results),
    [tab, results, favoriteIds],
  )

  const playlistEmpty = tab === 'favorites' && favoriteIds.size === 0

  return (
    <div className="min-h-screen">
      <Header tab={tab} onTabChange={setTab} favoriteCount={favoriteIds.size} />

      <FilterBar
        filters={filters}
        actions={actions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        decades={decades}
        isDirty={isDirty}
        resultCount={visible.length}
      />

      <main className="mx-auto max-w-7xl px-4 pb-20">
        {playlistEmpty ? (
          <EmptyState titleKey="playlistEmptyTitle" hintKey="playlistEmptyHint" />
        ) : (
          <ContentGrid
            items={visible}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onPlay={setPlaying}
          />
        )}
      </main>

      <footer className="border-t border-night-700 py-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-cream-500">
          ◆ Keep on Swingin' ◆
        </p>
      </footer>

      {/* 임베드 플레이어 모달 */}
      <PlayerModal item={playing} onClose={() => setPlaying(null)} />
    </div>
  )
}
