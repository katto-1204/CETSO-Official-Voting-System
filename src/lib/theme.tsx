import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('dark')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', 'dark')
    localStorage.setItem('cetso_theme', 'dark')
  }, [])

  function toggle() {
    // Locked in Dark Mode
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
