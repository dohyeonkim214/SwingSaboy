import { useCallback, useState } from 'react'

/** localStorage 키 — 스키마 바뀌면 버전 올려서 무효화 */
const STORAGE_KEY = 'savoy-archive:favorites:v1'

function loadFromStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    // 파싱 실패(손상된 값 등) 시 빈 목록으로 시작
    return new Set()
  }
}

/**
 * 즐겨찾기(내 플레이리스트) 훅.
 * - id 집합을 localStorage에 저장해 새로고침 후에도 유지
 * - toggleFavorite(id)로 추가/제거
 */
export function useFavorites() {
  const [ids, setIds] = useState(loadFromStorage)

  const toggleFavorite = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  return { favoriteIds: ids, toggleFavorite }
}
