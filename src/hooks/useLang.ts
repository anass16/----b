import { useI18n } from '@/lib/i18n'

export const useLang = () => {
  const { currentLanguage, setLanguage, t } = useI18n()
  
  return {
    currentLanguage,
    setLanguage,
    t
  }
}
