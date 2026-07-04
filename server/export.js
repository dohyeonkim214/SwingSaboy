/**
 * DB → 정적 스냅샷(src/data/archive.json) 내보내기.
 * Vercel 등에 백엔드 없이 정적 배포할 때 이 파일이 번들에 포함되어 데이터가 된다.
 * 사용: npm run export  (또는 수집까지 한 번에: npm run snapshot)
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { listItems, countItems } from './db.js'
import { seedIfEmpty } from './seed.js'

export function exportSnapshot() {
  seedIfEmpty() // DB가 처음이라도 최소한 큐레이션 데이터는 내보내지도록
  const items = listItems()
  const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'archive.json')
  writeFileSync(
    outPath,
    JSON.stringify({ exportedAt: new Date().toISOString(), items }, null, 1),
    'utf8',
  )
  console.log(`[export] ${countItems()}건 → src/data/archive.json`)
  return items.length
}

// CLI로 직접 실행됐을 때만 (import 시에는 실행 안 함)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  exportSnapshot()
}
