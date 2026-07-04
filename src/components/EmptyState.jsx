import { useI18n } from '../i18n/LanguageContext'

/**
 * 필터 결과가 없거나 플레이리스트가 비었을 때 보여주는 빈 상태 화면.
 * titleKey/hintKey는 i18n/strings.js의 키 (기본값: 필터 결과 없음 메시지).
 */
export default function EmptyState({ titleKey = 'emptyTitle', hintKey = 'emptyHint' }) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 rotate-45 items-center justify-center border border-gold-600/40">
        <span className="-rotate-45 text-2xl text-gold-500">♪</span>
      </div>
      <p className="font-display text-xl text-cream-300">{t[titleKey]}</p>
      <p className="mt-2 text-sm text-cream-500">{t[hintKey]}</p>
    </div>
  )
}
