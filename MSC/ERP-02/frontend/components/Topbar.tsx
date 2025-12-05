import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const Topbar: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current = resolvedTheme || theme

  return (
    <header className="flex items-center justify-between p-4 border-b app-border app-bg">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded app-surface app-border">Menu</button>
        <h3 className="text-lg font-medium app-text">Module</h3>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
          className="px-3 py-1 rounded text-sm app-surface app-border"
          aria-label="Toggle theme"
        >
          {mounted ? (current === 'dark' ? '🌤️ Light' : '🌙 Dark') : '...'}
        </button>
      </div>
    </header>
  )
}

export default Topbar
