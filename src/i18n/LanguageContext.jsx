/**
 * 언어 컨텍스트 — 라이브러리 없는 초경량 i18n.
 * 초기 언어: localStorage → 브라우저 언어(ko면 ko, 아니면 en) 순으로 결정하고,
 * 선택은 localStorage에 영속화한다.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS } from './strings'

const STORAGE_KEY = 'savoy-lang'

const LanguageContext = createContext(null)

function initialLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'ko' || saved === 'en') return saved
  return navigator.language?.startsWith('ko') ? 'ko' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang // 스크린리더·검색엔진용
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t: STRINGS[lang] }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** @returns {{lang: 'ko'|'en', setLang: (l:string)=>void, t: typeof STRINGS.ko}} */
export function useI18n() {
  return useContext(LanguageContext)
}
