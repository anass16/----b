import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Language {
  code: string
  name: string
  flag: string
}

interface I18nStore {
  currentLanguage: string
  translations: Record<string, any>
  setLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, any>) => string
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

// Import translations
import enTranslations from '@/locales/en.json'
import frTranslations from '@/locales/fr.json'

const translations = {
  en: enTranslations,
  fr: frTranslations
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      translations,
      setLanguage: (lang: string) => {
        set({ currentLanguage: lang })
      },
      t: (key: string, params?: Record<string, any>) => {
        const { currentLanguage, translations } = get()
        const keys = key.split('.')
        let value = translations[currentLanguage]
        
        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k]
          } else {
            return key // Return key if translation not found
          }
        }
        
        if (typeof value === 'string' && params) {
          return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] || match
          })
        }
        
        return value || key
      }
    }),
    {
      name: 'i18n-storage',
      partialize: (state) => ({ currentLanguage: state.currentLanguage })
    }
  )
)

export { languages }
