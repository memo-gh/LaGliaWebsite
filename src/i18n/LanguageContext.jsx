import { useCallback, useEffect, useMemo, useState } from 'react'
import { TRANSLATIONS } from './translations'
import { LanguageContext } from './useLanguage'

export function LanguageProvider({ defaultLanguage = 'it', children }) {
  const [language, setLanguageState] = useState(defaultLanguage)

  const setLanguage = useCallback((nextLang) => {
    const normalized = nextLang === 'en' ? 'en' : 'it'
    setLanguageState(normalized)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'it' ? 'en' : 'it'))
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: TRANSLATIONS[language] ?? TRANSLATIONS.it,
    }),
    [language, setLanguage, toggleLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
