import { useCallback, useEffect, useMemo, useState } from 'react'
import { TRANSLATIONS } from './translations'
import { LanguageContext } from './useLanguage'

function detectDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'it'

  const primaryLocale =
    (Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages[0]
      : navigator.language) || ''

  const normalized = primaryLocale.toLowerCase().trim()
  if (!normalized) return 'it'

  return normalized === 'it' || normalized.startsWith('it-') ? 'it' : 'en'
}

export function LanguageProvider({ defaultLanguage, children }) {
  const [language, setLanguageState] = useState(() => {
    if (defaultLanguage === 'it' || defaultLanguage === 'en') {
      return defaultLanguage
    }
    return detectDefaultLanguage()
  })

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
