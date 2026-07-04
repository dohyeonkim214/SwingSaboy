import ContentCard from './ContentCard'
import EmptyState from './EmptyState'

/**
 * 반응형 카드 그리드 — 모바일 1열 → 태블릿 2열 → 데스크톱 3열 → 와이드 4열
 */
export default function ContentGrid({ items, favoriteIds, onToggleFavorite, onPlay }) {
  if (items.length === 0) return <EmptyState />

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <ContentCard
          key={item.id}
          item={item}
          index={i}
          isFavorite={favoriteIds.has(item.id)}
          onToggleFavorite={onToggleFavorite}
          onPlay={onPlay}
        />
      ))}
    </div>
  )
}
