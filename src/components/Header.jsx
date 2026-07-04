import { useI18n } from '../i18n/LanguageContext'

/**
 * 사이트 헤더 — 아르데코 로고 + 탭 내비게이션(전체 아카이브 / 내 플레이리스트)
 * 우상단에 한/영 언어 토글.
 */
export default function Header({ tab, onTabChange, favoriteCount }) {
  const { lang, setLang, t } = useI18n()

  const tabs = [
    { id: 'all', label: t.tabArchive },
    { id: 'favorites', label: `${t.tabPlaylist}${favoriteCount ? ` (${favoriteCount})` : ''}` },
  ]

  return (
    <header className="relative border-b border-gold-600/30">
      {/* 언어 토글 — 브랜드 타이포와 어울리게 세그먼트 형태 */}
      <div className="absolute right-4 top-4 flex text-[11px] tracking-[0.15em]" role="group" aria-label="Language">
        {[
          { id: 'ko', label: '한국어' },
          { id: 'en', label: 'EN' },
        ].map((l, i) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            aria-pressed={lang === l.id}
            className={`border px-2.5 py-1 uppercase transition-colors ${i > 0 ? 'border-l-0' : ''} ${
              lang === l.id
                ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                : 'border-night-600 text-cream-500 hover:text-cream-300'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 text-center">
        {/* 아르데코 장식 라인 */}
        <div className="mx-auto mb-4 flex max-w-md items-center gap-3 text-gold-500">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-600/70" />
          <span className="text-xs tracking-[0.5em]">EST◆1926</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-600/70" />
        </div>

        <h1 className="font-deco text-4xl text-gold-400 sm:text-5xl md:text-6xl">
          Savoy Archive
        </h1>
        <p className="mt-3 font-display text-sm tracking-[0.35em] uppercase text-cream-300">
          Swing Dance · Music &amp; Film Collection
        </p>
        <p className="mt-2 text-xs text-cream-500">
          Lindy Hop · Balboa · Charleston · Collegiate Shag
        </p>

        {/* 탭 내비게이션 */}
        <nav className="mt-8 flex justify-center gap-2" aria-label={t.tabsAria}>
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => onTabChange(tb.id)}
              className={`border px-5 py-2 font-display text-sm tracking-[0.2em] uppercase transition-colors ${
                tab === tb.id
                  ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                  : 'border-night-600 text-cream-500 hover:border-gold-600/60 hover:text-cream-300'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
