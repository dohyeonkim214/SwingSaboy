# 🎷 Savoy Archive

스윙 댄서를 위한 음악·영상 큐레이션 아카이브.
Lindy Hop, Balboa, Charleston, Collegiate Shag 콘텐츠를 스타일·템포(BPM)·연대별로 탐색하고, 사이트 안에서 바로 재생할 수 있습니다.

## 실행

```bash
npm install
npm run dev      # 프론트 개발 서버 (http://localhost:5173)
npm run server   # 백엔드 API 서버 (http://localhost:3001) — 별도 터미널에서
npm run build    # 정적 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

백엔드가 없어도 앱은 동작합니다 — `/api/content` 호출이 실패하면 번들에 포함된
정적 스냅샷(`src/data/archive.json`)으로 자동 폴백합니다.

## Vercel 배포 (정적 스냅샷 방식)

Vercel은 서버리스라 Express 서버·SQLite·스케줄러가 그대로 올라가지 않습니다.
대신 로컬 DB를 JSON 스냅샷으로 내보내 번들에 포함시키는 방식을 씁니다:

```bash
npm run snapshot   # ① 유튜브 수집 1회 + DB → src/data/archive.json 내보내기
git add -A; git commit -m "archive snapshot"; git push   # ② 푸시
```

**최초 배포 (한 번만):**

1. GitHub에 저장소를 만들고 푸시 (`git init` → `git add -A` → `git commit` → `git push`)
2. [vercel.com](https://vercel.com) → **Add New Project** → 저장소 Import
3. Framework Preset이 **Vite**로 자동 감지됨 → 그대로 **Deploy**

이후에는 `npm run snapshot` → `git push`만 하면 Vercel이 자동 재배포합니다.
GitHub 없이 하려면 프로젝트 루트에서 `npx vercel --prod` 한 줄로도 됩니다.

- `.env`(API 키)와 `server/data/`(DB)는 gitignore 대상이라 배포에 포함되지 않습니다.
  수집은 항상 로컬에서 하고, 결과물(archive.json)만 올라갑니다.
- 매일 자동 갱신까지 원하면 GitHub Actions 크론으로 `npm run snapshot` + 커밋을
  돌리면 됩니다 (API 키는 저장소 Secret에 등록).

## 백엔드 (유튜브 자동 수집 엔진)

설계서: [.claude/docs/searchengine.md](.claude/docs/searchengine.md)
구조: **수집 스케줄러 → SQLite 캐시 → 자체 API → 프론트엔드** — 프론트는 유튜브 API를
직접 호출하지 않으므로 키 노출이 없고, 할당량(일 10,000유닛)도 하루 ~410유닛만 씁니다.

```
server/
├── index.js      # Express API — GET /api/content·/api/status, POST /api/collect
├── snapshot.js   # 수집 1회 + 스냅샷 내보내기 + 문서 역동기화 (원커맨드)
├── export.js     # DB → src/data/archive.json
├── docs-sync.js  # 코드→문서 역동기화 — .claude/docs/features/*.md의 auto:stats 구간 갱신
├── config.js     # 환경변수 + 스타일별 검색어·할당량 예산 (수집 튜닝 지점)
├── db.js         # node:sqlite 저장소 (Node 24 내장 — 네이티브 의존성 없음)
├── youtube.js    # YouTube Data API v3 클라이언트 (search 100유닛 / videos 1유닛)
├── collector.js  # 검색 → 상세 조회 → ContentItem 가공 → upsert
├── scheduler.js  # 24시간 주기 배치 (재시작해도 중복 수집 없음)
└── seed.js       # DB가 비면 content.json 큐레이션 데이터를 시드 (curated 보호)
```

**유튜브 API 키 연결:** `.env.example`을 `.env`로 복사하고 `YOUTUBE_API_KEY`를 채운 뒤
`npm run server`를 재시작하면 스케줄러가 즉시 첫 수집을 실행합니다.
수동 수집은 `curl -X POST http://localhost:3001/api/collect`, 상태 확인은 `/api/status`.

- 자동 수집 항목은 BPM을 알 수 없어 `bpm: null`로 저장됩니다 (카드에는 `–`로 표시,
  BPM 슬라이더를 좁히면 목록에서 제외).
- `content.json`에서 시드된 큐레이션 항목은 `curated` 플래그로 보호되어 수집기가
  BPM·스타일 등 수동 메타를 덮어쓰지 않습니다.
- DB 파일(`server/data/archive.db`)과 `.env`는 gitignore 대상입니다.

## 기술 스택

- **React 19 + Vite 7** — SPA, 빠른 HMR
- **Tailwind CSS 4** — `@theme` 토큰으로 디자인 시스템 정의 (별도 config 파일 없음)
- 외부 상태관리/슬라이더 라이브러리 없음 (훅 + 네이티브 input으로 구현)

## 폴더 구조

```
src/
├── data/content.json          # 샘플 데이터 — CMS/API 교체 지점 ①
├── services/contentService.js # 데이터 접근 계층 — CMS/API 교체 지점 ②
├── constants/catalog.js       # 스타일·타입·플랫폼·정렬 메타데이터 (단일 소스)
├── hooks/
│   ├── useContentFilters.js   # 검색·필터·정렬 상태 + 파생 목록 계산
│   └── useFavorites.js        # 즐겨찾기 (localStorage 영속화)
├── utils/format.js            # 길이 포맷, 썸네일/임베드 URL 생성
└── components/
    ├── Header.jsx             # 로고 + 탭 (아카이브 / 내 플레이리스트)
    ├── FilterBar.jsx          # 검색·스타일·타입·연대·BPM·정렬 UI
    ├── BpmRangeSlider.jsx     # 듀얼 레인지 슬라이더 (외부 라이브러리 없음)
    ├── ContentGrid.jsx        # 반응형 그리드 (1→2→3→4열)
    ├── ContentCard.jsx        # 콘텐츠 카드 (썸네일·태그·BPM·즐겨찾기)
    ├── PlayerModal.jsx        # YouTube/Spotify/SoundCloud 임베드 플레이어
    ├── TagBadge.jsx           # 스타일 태그 배지
    └── EmptyState.jsx         # 빈 결과 화면
```

## 데이터 스키마

`src/data/content.json`의 `items[]` 각 항목:

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 고유 슬러그 (즐겨찾기 저장 키) |
| `type` | `music` \| `video` \| `tutorial` | 콘텐츠 타입 |
| `title` / `artist` | string | 제목 / 아티스트·밴드·댄서 |
| `styles` | string[] | `lindy` \| `balboa` \| `charleston` \| `shag` (복수 가능) |
| `bpm` | number | 템포 (근사치) |
| `year` | number | 녹음·촬영 연도 (연대 필터에 사용) |
| `durationSec` | number | 길이(초) |
| `popularity` | number | 0~100 (인기순 정렬용) |
| `addedAt` | string | 등록일 ISO 날짜 (최신순 정렬용) |
| `source` | object | `{ platform: 'youtube'\|'spotify'\|'soundcloud', id, url? }` — SoundCloud만 `url` 필수 |

### CMS/API로 교체하기

UI는 데이터 출처를 모릅니다. [contentService.js](src/services/contentService.js)의 `fetchContent()` 한 함수만 고치면 됩니다:

```js
export async function fetchContent() {
  const res = await fetch('https://api.example.com/content')
  return res.json()
}
```

## 샘플 데이터에 대한 주의

- YouTube/Spotify ID는 **실제 공개 콘텐츠**를 검색해 넣었습니다 (Hellzapoppin' 1941, Venice Beach 1938, Arthur Murray Shag 1937 등). 다만 원본 업로더가 영상을 내리면 재생이 안 될 수 있습니다.
- **BPM·길이(durationSec)·인기도(popularity)·연도 일부는 데모용 근사치**입니다. 실제 서비스 전에 검수하세요.
- SoundCloud는 코드에서 지원하지만(임베드/링크) 샘플 데이터에는 검증된 트랙이 없어 포함하지 않았습니다.

## 디자인

1930~40년대 재즈클럽 무드 + 현대적 미니멀:

- 다크 세피아-블랙 배경(`night-*`) 위에 골드/브라스(`gold-*`) 포인트
- 아르데코 타이포: Limelight(로고) · Poiret One(헤딩) · Josefin Sans(본문)
- 다이아몬드(◆) 모티프 — 슬라이더 썸, 구분자, 빈 상태 아이콘
- 카드 hover 시 부드러운 리프트 + 골드 섀도우, 진입 스태거 애니메이션

토큰은 전부 [src/index.css](src/index.css)의 `@theme` 블록에 있습니다.
