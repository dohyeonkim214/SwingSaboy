import { BPM_MIN, BPM_MAX } from '../constants/catalog'
import { useI18n } from '../i18n/LanguageContext'

/**
 * BPM 범위 듀얼 슬라이더.
 * 네이티브 range input 두 개를 같은 트랙 위에 겹치고(thumb만 클릭 가능),
 * 선택 구간은 골드 하이라이트 바로 표시한다. 외부 라이브러리 불필요.
 */
export default function BpmRangeSlider({ value, onChange }) {
  const { t } = useI18n()
  const [lo, hi] = value
  const span = BPM_MAX - BPM_MIN
  const loPct = ((lo - BPM_MIN) / span) * 100
  const hiPct = ((hi - BPM_MIN) / span) * 100

  // 두 썸이 교차하지 않도록 클램프
  const setLo = (v) => onChange([Math.min(Number(v), hi - 5), hi])
  const setHi = (v) => onChange([lo, Math.max(Number(v), lo + 5)])

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] tracking-[0.2em] uppercase text-cream-500">Tempo (BPM)</span>
        <span className="font-display text-sm text-gold-300">
          {lo} – {hi}
        </span>
      </div>

      <div className="relative h-4">
        {/* 배경 트랙 */}
        <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-night-600" />
        {/* 선택 구간 하이라이트 */}
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gold-500"
          style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
        />
        {/* 겹쳐진 두 개의 range input */}
        <input
          type="range" min={BPM_MIN} max={BPM_MAX} step={5} value={lo}
          onChange={(e) => setLo(e.target.value)}
          className="bpm-thumb absolute top-0 h-4 w-full"
          aria-label={t.bpmMinAria}
        />
        <input
          type="range" min={BPM_MIN} max={BPM_MAX} step={5} value={hi}
          onChange={(e) => setHi(e.target.value)}
          className="bpm-thumb absolute top-0 h-4 w-full"
          aria-label={t.bpmMaxAria}
        />
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-cream-500">
        <span>{BPM_MIN}</span>
        <span>{BPM_MAX}</span>
      </div>
    </div>
  )
}
