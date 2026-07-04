/**
 * 시드 — DB가 비어 있을 때 초기 데이터를 넣는다.
 *
 * 1순위: src/data/archive.json (마지막 스냅샷) — GitHub Actions처럼 DB가 매 실행마다
 *        새로 시작하는 환경에서 이전까지 모은 아카이브를 이어받아 누적시키기 위함.
 * 2순위: src/data/content.json (원본 큐레이션 18건) — 최초 실행용.
 *
 * curated=1 항목은 자동 수집기가 BPM·스타일 등 수동 메타를 덮어쓰지 않는다.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { countItems, upsertItem } from './db.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export function seedIfEmpty() {
  if (countItems() > 0) return 0

  // 마지막 스냅샷이 있으면 그것이 곧 이전 상태의 전체 아카이브다 (curated 플래그 포함)
  const archivePath = join(ROOT, 'src', 'data', 'archive.json')
  if (existsSync(archivePath)) {
    const { items } = JSON.parse(readFileSync(archivePath, 'utf8'))
    if (items?.length) {
      for (const item of items) upsertItem(item)
      console.log(`[seed] 스냅샷(archive.json) ${items.length}건을 DB에 시드했습니다`)
      return items.length
    }
  }

  const { items } = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'content.json'), 'utf8'))
  for (const item of items) {
    upsertItem({ ...item, curated: true })
  }
  console.log(`[seed] 큐레이션 항목 ${items.length}건을 DB에 시드했습니다`)
  return items.length
}
