/**
 * famousSwingMusic.json의 큐레이션 음악 중 'query'(검색어)만 있고 실제 영상 id가
 * 없는 항목을 유튜브에서 검색해 진짜 videoId로 채워넣는다.
 *
 * listType=search 임베드가 더 이상 동작하지 않아 (PlayerModal.jsx 참고) 실제 id가
 * 필요해졌다 — collector.js와 같은 youtube.js를 재사용하되, 여기서는 DB에 넣지 않고
 * 큐레이션 메타(제목·아티스트·bpm 등)는 그대로 둔 채 source만 갱신한다.
 *
 * 실행: npm run resolve-music (search.list 1회 100유닛 × 항목 수 소모)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchVideoIds } from './youtube.js'
import { YOUTUBE_API_KEY } from './config.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = join(ROOT, 'src', 'data', 'famousSwingMusic.json')

/** styles/source는 한 줄로, 나머지는 한 줄에 하나씩 — 기존 famousSwingMusic.json 스타일 유지 */
function formatItem(item, indent) {
  const pad2 = ' '.repeat(indent + 2)
  const keys = Object.keys(item)
  const lines = keys.map((k, i) => {
    const comma = i < keys.length - 1 ? ',' : ''
    if (k === 'styles') return `${pad2}"styles": [${item[k].map((s) => JSON.stringify(s)).join(', ')}]${comma}`
    if (k === 'source') {
      const src = Object.entries(item[k]).map(([sk, sv]) => `"${sk}": ${JSON.stringify(sv)}`).join(', ')
      return `${pad2}"source": { ${src} }${comma}`
    }
    return `${pad2}${JSON.stringify(k)}: ${JSON.stringify(item[k])}${comma}`
  })
  // 여는 중괄호는 호출부(writeData)가 이미 indent만큼 들여쓴 뒤 이 문자열을 이어붙이므로 여기선 붙이지 않는다
  return `{\n${lines.join('\n')}\n${' '.repeat(indent)}}`
}

function writeData(data) {
  const body = data.items.map((item, i) => `    ${formatItem(item, 4)}${i < data.items.length - 1 ? ',' : ''}`).join('\n')
  const out = `{\n  "$schema-note": ${JSON.stringify(data['$schema-note'])},\n  "items": [\n${body}\n  ]\n}\n`
  writeFileSync(DATA_PATH, out)
}

async function main() {
  if (!YOUTUBE_API_KEY) {
    console.error('[resolve-music] YOUTUBE_API_KEY 미설정 — .env를 확인하세요')
    process.exit(1)
  }

  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  const results = []

  for (const item of data.items) {
    if (item.source.id) {
      results.push({ id: item.id, status: 'skip (이미 id 있음)' })
      continue
    }
    const query = item.source.query
    try {
      const { ids } = await searchVideoIds(query)
      if (!ids.length) {
        results.push({ id: item.id, status: '검색 결과 없음', query })
        continue
      }
      // 큐레이션 메타(제목·아티스트·bpm 등)는 손대지 않고 source만 실제 id로 교체
      item.source = { platform: 'youtube', id: ids[0] }
      results.push({ id: item.id, status: '해결됨', videoId: ids[0], query })
    } catch (err) {
      results.push({ id: item.id, status: `오류: ${err.message}`, query })
    }
  }

  writeData(data)
  console.table(results)
  const resolved = results.filter((r) => r.status === '해결됨').length
  console.log(`[resolve-music] ${resolved}/${results.length}건 해결, famousSwingMusic.json 갱신 완료`)
}

main()
