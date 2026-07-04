/**
 * 저장소 계층 — Node 내장 SQLite(node:sqlite) 사용으로 네이티브 의존성 없음.
 * DB 파일은 server/data/ 아래 생성되며 gitignore 대상.
 */
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data')
mkdirSync(DATA_DIR, { recursive: true })

const db = new DatabaseSync(join(DATA_DIR, 'archive.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id           TEXT PRIMARY KEY,      -- 'yt-<videoId>' 또는 큐레이션 슬러그
    type         TEXT NOT NULL,         -- music | video | tutorial
    title        TEXT NOT NULL,
    artist       TEXT NOT NULL,
    styles       TEXT NOT NULL,         -- JSON 배열 문자열 (예: '["lindy"]')
    bpm          INTEGER,               -- 자동 수집분은 NULL (측정 불가)
    year         INTEGER NOT NULL,
    duration_sec INTEGER NOT NULL,
    popularity   INTEGER NOT NULL,
    added_at     TEXT NOT NULL,         -- ISO 날짜 (최신순 정렬 기준)
    platform     TEXT NOT NULL,         -- youtube | spotify | soundcloud
    source_id    TEXT NOT NULL,
    source_url   TEXT,
    view_count   INTEGER,               -- 원본 조회수 (popularity 재계산용)
    curated      INTEGER NOT NULL DEFAULT 0, -- 1 = 수동 큐레이션(시드) → 수집기가 덮어쓰지 않음
    updated_at   TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_items_added ON items(added_at DESC);

  -- 수집 이력·할당량 등 키-값 메타
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

/** DB 행 → 프론트엔드 ContentItem 스키마 (contentService.js의 @typedef와 동일) */
function rowToItem(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    artist: row.artist,
    styles: JSON.parse(row.styles),
    bpm: row.bpm,
    year: row.year,
    durationSec: row.duration_sec,
    popularity: row.popularity,
    addedAt: row.added_at,
    source: {
      platform: row.platform,
      id: row.source_id,
      ...(row.source_url ? { url: row.source_url } : {}),
    },
    // 스냅샷(archive.json)을 다시 시드할 때 큐레이션 보호 플래그가 유지되도록 포함
    curated: Boolean(row.curated),
  }
}

export function listItems() {
  return db
    .prepare('SELECT * FROM items ORDER BY added_at DESC, popularity DESC')
    .all()
    .map(rowToItem)
}

export function countItems() {
  return db.prepare('SELECT COUNT(*) AS n FROM items').get().n
}

const upsertStmt = db.prepare(`
  INSERT INTO items (id, type, title, artist, styles, bpm, year, duration_sec,
                     popularity, added_at, platform, source_id, source_url,
                     view_count, curated, updated_at)
  VALUES (:id, :type, :title, :artist, :styles, :bpm, :year, :durationSec,
          :popularity, :addedAt, :platform, :sourceId, :sourceUrl,
          :viewCount, :curated, :updatedAt)
  ON CONFLICT(id) DO UPDATE SET
    -- 큐레이션 항목은 메타를 보존하고, 자동 수집 항목만 최신 정보로 갱신
    title        = CASE WHEN items.curated THEN items.title ELSE excluded.title END,
    artist       = CASE WHEN items.curated THEN items.artist ELSE excluded.artist END,
    type         = CASE WHEN items.curated THEN items.type ELSE excluded.type END,
    styles       = CASE WHEN items.curated THEN items.styles ELSE excluded.styles END,
    popularity   = CASE WHEN items.curated THEN items.popularity ELSE excluded.popularity END,
    view_count   = excluded.view_count,
    duration_sec = CASE WHEN items.curated THEN items.duration_sec ELSE excluded.duration_sec END,
    updated_at   = excluded.updated_at
`)

/**
 * 항목 upsert. 이미 있는 자동 수집 항목이면 styles를 합집합으로 병합한다
 * (같은 영상이 lindy와 charleston 두 검색에 모두 걸리는 경우).
 */
export function upsertItem(item) {
  const existing = db.prepare('SELECT styles, curated FROM items WHERE id = ?').get(item.id)
  let styles = item.styles
  if (existing && !existing.curated) {
    styles = [...new Set([...JSON.parse(existing.styles), ...item.styles])]
  }
  upsertStmt.run({
    id: item.id,
    type: item.type,
    title: item.title,
    artist: item.artist,
    styles: JSON.stringify(styles),
    bpm: item.bpm ?? null,
    year: item.year,
    durationSec: item.durationSec,
    popularity: item.popularity,
    addedAt: item.addedAt,
    platform: item.source.platform,
    sourceId: item.source.id,
    sourceUrl: item.source.url ?? null,
    viewCount: item.viewCount ?? null,
    curated: item.curated ? 1 : 0,
    updatedAt: new Date().toISOString(),
  })
}

export function getMeta(key) {
  return db.prepare('SELECT value FROM meta WHERE key = ?').get(key)?.value ?? null
}

export function setMeta(key, value) {
  db.prepare(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, String(value))
}

/** 오늘(UTC 기준 근사) 사용한 할당량 유닛 — 유튜브 리셋은 PDT 자정이므로 보수적 근사치 */
export function getQuotaUsedToday() {
  return Number(getMeta(`quota:${new Date().toISOString().slice(0, 10)}`) ?? 0)
}

export function addQuotaUsed(units) {
  const key = `quota:${new Date().toISOString().slice(0, 10)}`
  setMeta(key, Number(getMeta(key) ?? 0) + units)
}
