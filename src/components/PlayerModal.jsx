import { useEffect } from 'react'
import { PLATFORMS } from '../constants/catalog'
import { useI18n } from '../i18n/LanguageContext'
import { getEmbedUrl, getSourceUrl } from '../utils/format'
import TagBadge from './TagBadge'

/**
 * 임베드 플레이어 모달 — YouTube/Spotify/SoundCloud를 사이트 안에서 바로 재생.
 * ESC 키 또는 배경 클릭으로 닫힌다.
 */
export default function PlayerModal({ item, onClose }) {
  const { t } = useI18n()
  // ESC로 닫기 + 모달이 떠 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!item) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  if (!item) return null

  const embedUrl = getEmbedUrl(item.source)
  const isSpotify = item.source.platform === 'spotify'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.playerAria(item.title)}
    >
      {/* stopPropagation: 모달 내부 클릭은 닫기로 전파되지 않도록 */}
      <div
        className="w-full max-w-3xl border border-gold-600/50 bg-night-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4 border-b border-night-700 p-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl text-gold-300">{item.title}</h2>
            <p className="mt-0.5 text-sm text-cream-500">
              {item.artist}
              <span className="mx-2 text-night-600">◆</span>
              {item.year} · {item.bpm ?? '–'} BPM
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="shrink-0 text-2xl leading-none text-cream-500 transition-colors hover:text-gold-300"
          >
            ✕
          </button>
        </div>

        {/* 플레이어 — Spotify 트랙 위젯은 고정 높이, 영상류는 16:9 */}
        <div className={isSpotify ? 'p-4' : 'aspect-video'}>
          <iframe
            src={embedUrl}
            title={item.title}
            width="100%"
            height={isSpotify ? 152 : '100%'}
            allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
            allowFullScreen
            className={isSpotify ? '' : 'h-full w-full'}
            style={{ border: 0 }}
          />
        </div>

        {/* 푸터: 태그 + 원본 링크 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night-700 p-4">
          <div className="flex flex-wrap gap-1.5">
            {item.styles.map((s) => (
              <TagBadge key={s} styleId={s} />
            ))}
          </div>
          <a
            href={getSourceUrl(item.source)}
            target="_blank"
            rel="noreferrer"
            className="text-xs tracking-wider text-cream-500 underline-offset-4 hover:text-gold-300 hover:underline"
          >
            {t.openOn(PLATFORMS[item.source.platform]?.label)}
          </a>
        </div>
      </div>
    </div>
  )
}
