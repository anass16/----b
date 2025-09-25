import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-theme',
    }
  )
)

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore()

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (t === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(t)
  }

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme, applyTheme }
}
