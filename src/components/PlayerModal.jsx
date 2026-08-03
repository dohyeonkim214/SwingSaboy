import { useEffect, useRef, useState } from 'react'
import { PLATFORMS } from '../constants/catalog'
import { useI18n } from '../i18n/LanguageContext'
import { getEmbedUrl, getSourceUrl, getSpotifySearchUrl } from '../utils/format'
import TagBadge from './TagBadge'

/**
 * YouTube IFrame Player API 로더 — 앱 전체에서 한 번만 스크립트를 붙인다.
 * 바로 <iframe src="...embed...">를 쓰지 않는 이유: onError 콜백이 있어야
 * "재생 불가" 상태를 코드로 감지해 Spotify 폴백을 보여줄 수 있기 때문.
 */
let ytApiPromise = null
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

/**
 * 임베드 플레이어 모달 — YouTube/Spotify/SoundCloud를 사이트 안에서 바로 재생.
 * ESC 키 또는 배경 클릭으로 닫힌다.
 */
export default function PlayerModal({ item, onClose }) {
  const { t } = useI18n()
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [unavailable, setUnavailable] = useState(false)

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

  const isYoutube = item?.source.platform === 'youtube'
  // 'query'(검색어) 기반 항목: 유튜브가 지원하던 listType=search 임베드가 지금은 없어져
  // 재생 자체가 불가능하다 — 시도 없이 바로 재생 불가로 처리한다 (실제 영상 id가 있는
  // 자동 수집분만 정상적으로 임베드된다)
  const hasQueryOnly = isYoutube && !item?.source.id

  // YouTube 항목 중 실제 영상 id가 있는 것만 IFrame Player API로 재생 — onError 시 재생 불가로 표시
  useEffect(() => {
    setUnavailable(hasQueryOnly)
    if (!item || !isYoutube || hasQueryOnly) return
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled || !containerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        videoId: item.source.id,
        playerVars: { autoplay: 1, rel: 0 },
        events: {
          onReady: (e) => {
            const iframe = e.target.getIframe?.()
            if (iframe) iframe.style.border = '0'
          },
          // 에러 코드: 2(잘못된 파라미터) 5(HTML5 오류) 100(삭제/비공개) 101/150(임베드 재생 금지)
          onError: () => setUnavailable(true),
        },
      })
    })

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy?.()
      } catch {
        /* 모달이 닫히며 컨테이너가 이미 제거된 경우 무시 */
      }
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  if (!item) return null

  const isSpotify = item.source.platform === 'spotify'
  // 재생 불가 + Spotify 검색어가 있는 큐레이션 음악: 유튜브 링크는 아예 감추고 Spotify만 안내
  const spotifyOnly = unavailable && Boolean(item.spotifyQuery)

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
        <div className={isSpotify ? 'p-4' : 'relative aspect-video'}>
          {isYoutube && (
            <div ref={containerRef} className={`h-full w-full ${unavailable ? 'invisible' : ''}`} />
          )}
          {!isYoutube && (
            <iframe
              src={getEmbedUrl(item.source)}
              title={item.title}
              width="100%"
              height={isSpotify ? 152 : '100%'}
              allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
              allowFullScreen
              className={isSpotify ? '' : 'h-full w-full'}
              style={{ border: 0 }}
            />
          )}

          {/* 유튜브 재생 실패 시: Spotify 검색어가 있으면 그쪽으로 바로 안내 */}
          {unavailable && isYoutube && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-night-900 px-6 text-center">
              <p className="text-sm text-cream-400">{t.videoUnavailable}</p>
              {item.spotifyQuery && (
                <a
                  href={getSpotifySearchUrl(item.spotifyQuery)}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-gold-500 px-4 py-2 text-sm tracking-wider text-gold-300 transition-colors hover:bg-gold-500/10"
                >
                  {t.openOn(PLATFORMS.spotify.label)}
                </a>
              )}
            </div>
          )}
        </div>

        {/* 푸터: 태그 + 원본 링크 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night-700 p-4">
          <div className="flex flex-wrap gap-1.5">
            {item.styles.map((s) => (
              <TagBadge key={s} styleId={s} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* 큐레이션 음악은 기본 소스가 YouTube라도 Spotify 검색 링크를 별도로 제공 (재생 불가 시엔 위 CTA와 중복되므로 숨김) */}
            {item.spotifyQuery && item.source.platform !== 'spotify' && !spotifyOnly && (
              <a
                href={getSpotifySearchUrl(item.spotifyQuery)}
                target="_blank"
                rel="noreferrer"
                className="text-xs tracking-wider text-cream-500 underline-offset-4 hover:text-gold-300 hover:underline"
              >
                {t.openOn(PLATFORMS.spotify.label)}
              </a>
            )}
            {!spotifyOnly && (
              <a
                href={getSourceUrl(item.source)}
                target="_blank"
                rel="noreferrer"
                className="text-xs tracking-wider text-cream-500 underline-offset-4 hover:text-gold-300 hover:underline"
              >
                {t.openOn(PLATFORMS[item.source.platform]?.label)}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
