/**
 * 코드 → 문서 역동기화.
 * 스냅샷(src/data/archive.json)에서 실측 통계를 계산해
 * .claude/docs/features/*.md 안의 자동 생성 구간을 갱신한다.
 *
 * 문서 쪽 마커:
 *   <!-- auto:stats -->
 *   (이 사이는 스크립트가 덮어씀 — 직접 수정 금지)
 *   <!-- /auto:stats -->
 *
 * 마커가 없는 문서는 건드리지 않으므로, 새 문서에 실측 수치가 필요하면
 * 마커 한 쌍만 넣으면 된다. 실행: npm run docs:sync (snapshot에도 포함)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS_DIR = join(ROOT, '.claude', 'docs', 'features')
const MARKER_RE = /<!-- auto:stats -->[\s\S]*?<!-- \/auto:stats -->/g

/** 스냅샷 기준 실측 통계 → 마크다운 블록 */
function buildStatsBlock() {
  const { items, exportedAt } = JSON.parse(
    readFileSync(join(ROOT, 'src', 'data', 'archive.json'), 'utf8'),
  )

  const count = (pred) => items.filter(pred).length
  const styleCounts = ['lindy', 'balboa', 'charleston', 'shag']
    .map((s) => `${s[0].toUpperCase()}${s.slice(1)} ${count((it) => it.styles.includes(s))}`)
    .join(' · ')
  const typeCounts = [
    ['video', '영상'],
    ['tutorial', '튜토리얼'],
    ['music', '음악'],
  ]
    .map(([id, label]) => `${label} ${count((it) => it.type === id)}`)
    .join(' · ')
  const withBpm = count((it) => it.bpm != null)
  const curated = count((it) => it.curated)

  return `<!-- auto:stats -->
> ⚙️ 자동 생성 구간 — \`npm run docs:sync\`가 \`src/data/archive.json\` 기준으로 갱신합니다. 직접 수정 금지.
> 마지막 동기화: ${new Date().toISOString().slice(0, 10)} (스냅샷 기준: ${exportedAt?.slice(0, 10) ?? '-'})

| 항목 | 실측값 |
|---|---|
| 총 콘텐츠 | **${items.length}개** |
| 스타일 분포 | ${styleCounts} |
| 타입 분포 | ${typeCounts} |
| BPM 보유 | ${withBpm}개 (${Math.round((withBpm / items.length) * 100)}%) |
| 출처 | 큐레이션 ${curated} · 자동수집 ${items.length - curated} |
<!-- /auto:stats -->`
}

export function syncDocs() {
  if (!existsSync(DOCS_DIR)) {
    console.log('[docs-sync] .claude/docs/features 디렉터리 없음 — 건너뜀')
    return 0
  }
  const block = buildStatsBlock()
  let updated = 0

  for (const file of readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))) {
    const path = join(DOCS_DIR, file)
    const src = readFileSync(path, 'utf8')
    if (!MARKER_RE.test(src)) continue
    MARKER_RE.lastIndex = 0 // g 플래그 정규식은 test 후 상태가 남으므로 리셋
    const next = src.replace(MARKER_RE, block)
    if (next !== src) {
      writeFileSync(path, next, 'utf8')
      updated++
      console.log(`[docs-sync] 갱신: ${file}`)
    }
  }
  console.log(`[docs-sync] 완료 — ${updated}개 문서 갱신`)
  return updated
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncDocs()
}
