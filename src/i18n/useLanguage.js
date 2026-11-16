import { createContext, useContext } from 'react'
import { TRANSLATIONS } from './translations'

export const LanguageContext = createContext({
  language: 'it',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: TRANSLATIONS.it,
})

export function useLanguage() {
  return useContext(LanguageContext)
}
