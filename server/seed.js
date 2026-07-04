/**
 * 시드 — DB가 비어 있으면 기존 큐레이션 데이터(src/data/content.json)를 넣는다.
 * curated=1로 저장되어 자동 수집기가 BPM·스타일 등 수동 메타를 덮어쓰지 않는다.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { countItems, upsertItem } from './db.js'

export function seedIfEmpty() {
  if (countItems() > 0) return 0

  const jsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'content.json')
  const { items } = JSON.parse(readFileSync(jsonPath, 'utf8'))
  for (const item of items) {
    upsertItem({ ...item, curated: true })
  }
  console.log(`[seed] 큐레이션 항목 ${items.length}건을 DB에 시드했습니다`)
  return items.length
}
