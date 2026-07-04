/**
 * 필터 결과가 없거나 플레이리스트가 비었을 때 보여주는 빈 상태 화면
 */
export default function EmptyState({
  title = '조건에 맞는 콘텐츠가 없습니다',
  hint = '필터를 조금 풀거나 검색어를 바꿔보세요.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 rotate-45 items-center justify-center border border-gold-600/40">
        <span className="-rotate-45 text-2xl text-gold-500">♪</span>
      </div>
      <p className="font-display text-xl text-cream-300">{title}</p>
      <p className="mt-2 text-sm text-cream-500">{hint}</p>
    </div>
  )
}
