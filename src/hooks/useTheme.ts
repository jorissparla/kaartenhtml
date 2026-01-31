import { useEffect, useState } from 'react'
import { themes, Theme } from '../themes'

export function useTheme() {
  const defaultTheme: Theme = themes.find((t) => t.id === 'light') ?? { name: 'Light', id: 'light', swatch: '#0969da' }
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme)
  const [themeOpen, setThemeOpen] = useState<boolean>(false)

  useEffect(() => {
    const savedThemeName = localStorage.getItem('theme')
    if (savedThemeName) {
      const found = themes.find((t) => t.name === savedThemeName)
      setSelectedTheme((prev) => (found ? found : prev))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', selectedTheme.name)
  }, [selectedTheme])

  function openTheme() {
    setThemeOpen(true)
  }

  function closeTheme() {
    setThemeOpen(false)
  }

  return {
    selectedTheme,
    setSelectedTheme,
    themeOpen,
    openTheme,
    closeTheme,
  }
}
