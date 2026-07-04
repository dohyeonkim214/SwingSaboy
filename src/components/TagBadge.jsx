import { STYLES } from '../constants/catalog'

/** 스타일 id → 라벨 매핑 (없으면 id 그대로) */
const labelOf = (id) => STYLES.find((s) => s.id === id)?.label ?? id

/**
 * 스타일 태그 배지 — 카드와 필터 어디서든 동일한 모양을 쓰기 위한 최소 단위 컴포넌트
 */
export default function TagBadge({ styleId }) {
  return (
    <span className="inline-block border border-gold-600/60 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase text-gold-300">
      {labelOf(styleId)}
    </span>
  )
}
