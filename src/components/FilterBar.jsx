import { STYLES, TYPES, SORT_OPTIONS } from '../constants/catalog'
import { useI18n } from '../i18n/LanguageContext'
import BpmRangeSlider from './BpmRangeSlider'

/** 칩(토글 버튼) 공통 스타일 */
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 text-xs tracking-wider transition-colors ${
        active
          ? 'border-gold-500 bg-gold-500/15 text-gold-300'
          : 'border-night-600 text-cream-500 hover:border-gold-600/50 hover:text-cream-300'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * 필터 바 — 검색 / 스타일 / 타입 / 연대 / BPM 범위 / 정렬을 한곳에서.
 * 상태는 전부 useContentFilters 훅이 소유하고, 여기는 표시와 이벤트 위임만 담당.
 */
export default function FilterBar({
  filters, actions, sortBy, setSortBy, decades, isDirty, resultCount,
}) {
  const { t } = useI18n()

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-6"
      aria-label={t.filterAria}
    >
      <div className="border border-night-600 bg-night-900/70 p-5 shadow-lg shadow-black/40 backdrop-blur">
        {/* 1행: 검색 + 정렬 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">
              ⌕
            </span>
            <input
              type="search"
              value={filters.query}
              onChange={(e) => actions.setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full border border-night-600 bg-night-950 py-2.5 pl-9 pr-3 text-sm text-cream-100 placeholder:text-cream-500 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label={t.sortAria}
            className="border border-night-600 bg-night-950 px-3 py-2.5 text-sm text-cream-300 focus:border-gold-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{t[o.labelKey]}</option>
            ))}
          </select>
        </div>

        {/* 2행: 스타일 / 타입 / 연대 / BPM */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto_auto_260px]">
          {/* 스타일 태그 */}
          <div>
            <p className="mb-2 text-[11px] tracking-[0.2em] uppercase text-cream-500">Style</p>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip
                  key={s.id}
                  active={filters.styles.includes(s.id)}
                  onClick={() => actions.toggleStyle(s.id)}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* 콘텐츠 타입 */}
          <div>
            <p className="mb-2 text-[11px] tracking-[0.2em] uppercase text-cream-500">Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((ty) => (
                <Chip
                  key={ty.id}
                  active={filters.types.includes(ty.id)}
                  onClick={() => actions.toggleType(ty.id)}
                >
                  {ty.icon} {t[ty.labelKey]}
                </Chip>
              ))}
            </div>
          </div>

          {/* 연대 */}
          <div>
            <p className="mb-2 text-[11px] tracking-[0.2em] uppercase text-cream-500">Era</p>
            <select
              value={filters.decade}
              onChange={(e) =>
                actions.setDecade(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="border border-night-600 bg-night-950 px-3 py-1.5 text-sm text-cream-300 focus:border-gold-500 focus:outline-none"
            >
              <option value="all">{t.allEras}</option>
              {decades.map((d) => (
                <option key={d} value={d}>{d}s</option>
              ))}
            </select>
          </div>

          {/* BPM 범위 슬라이더 */}
          <BpmRangeSlider value={filters.bpmRange} onChange={actions.setBpmRange} />
        </div>

        {/* 3행: 결과 개수 + 초기화 */}
        <div className="mt-4 flex items-center justify-between border-t border-night-700 pt-3">
          <p className="text-xs text-cream-500">
            <span className="text-gold-400">{resultCount}</span>{t.resultsSuffix}
          </p>
          {isDirty && (
            <button
              onClick={actions.reset}
              className="text-xs tracking-wider text-cream-500 underline-offset-4 hover:text-gold-300 hover:underline"
            >
              {t.resetFilters}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
