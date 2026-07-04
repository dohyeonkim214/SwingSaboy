import { PLATFORMS, TYPES } from '../constants/catalog'
import { formatDuration, getThumbnailUrl } from '../utils/format'
import TagBadge from './TagBadge'

/** 타입 id → 라벨 */
const typeLabelOf = (id) => TYPES.find((t) => t.id === id)?.label ?? id

/**
 * Spotify/SoundCloud처럼 썸네일 이미지가 없는 항목을 위한
 * 아르데코 스타일 placeholder — 방사형 골드 선 + 음표 모노그램
 */
function DecoPlaceholder({ title }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night-700 via-night-800 to-night-950"
      aria-hidden
    >
      <div className="relative flex h-20 w-20 items-center justify-center border border-gold-600/50 rotate-45">
        <span className="-rotate-45 font-deco text-3xl text-gold-400">
          {title.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  )
}

/**
 * 콘텐츠 카드 — 그리드의 기본 단위.
 * 카드 클릭 → 임베드 플레이어 모달, 하트 클릭 → 즐겨찾기 토글.
 */
export default function ContentCard({ item, isFavorite, onToggleFavorite, onPlay, index }) {
  const thumb = getThumbnailUrl(item.source)
  const platform = PLATFORMS[item.source.platform]

  return (
    <article
      className="group animate-card-in border border-night-600 bg-night-900/80 shadow-md shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/70 hover:shadow-xl hover:shadow-gold-500/10"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* ── 썸네일 영역 (클릭 시 재생) ── */}
      <button
        onClick={() => onPlay(item)}
        className="relative block aspect-video w-full overflow-hidden text-left"
        aria-label={`${item.title} 재생`}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <DecoPlaceholder title={item.title} />
        )}

        {/* hover 시 재생 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center bg-night-950/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400 bg-night-950/70 pl-1 text-xl text-gold-300">
            ▶
          </span>
        </div>

        {/* 좌상단: 타입 배지 / 우하단: 길이 */}
        <span className="absolute left-2 top-2 bg-night-950/85 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase text-cream-300">
          {typeLabelOf(item.type)}
        </span>
        <span className="absolute bottom-2 right-2 bg-night-950/85 px-1.5 py-0.5 font-mono text-[11px] text-cream-300">
          {formatDuration(item.durationSec)}
        </span>
      </button>

      {/* ── 본문 ── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg leading-snug text-cream-100" title={item.title}>
              {item.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-cream-500">{item.artist}</p>
          </div>
          {/* 즐겨찾기 토글 */}
          <button
            onClick={() => onToggleFavorite(item.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? '플레이리스트에서 제거' : '플레이리스트에 추가'}
            className={`shrink-0 text-xl leading-none transition-transform hover:scale-125 ${
              isFavorite ? 'text-gold-400' : 'text-night-600 hover:text-gold-600'
            }`}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>

        {/* 스타일 태그 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.styles.map((s) => (
            <TagBadge key={s} styleId={s} />
          ))}
        </div>

        {/* 메타 정보: BPM · 연도 · 출처 */}
        <div className="mt-3 flex items-center justify-between border-t border-night-700 pt-3 text-xs text-cream-500">
          <span>
            <span className="font-semibold text-gold-400">{item.bpm ?? '–'}</span> BPM
            <span className="mx-1.5 text-night-600">◆</span>
            {item.year}
          </span>
          <span className={platform?.badgeClass}>{platform?.label}</span>
        </div>
      </div>
    </article>
  )
}
