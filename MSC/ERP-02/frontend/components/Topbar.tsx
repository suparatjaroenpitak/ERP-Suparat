import React from 'react'
import { useTheme } from 'next-themes'

const Topbar: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded bg-gray-100 dark:bg-gray-700">Menu</button>
        <h3 className="text-lg font-medium">Module</h3>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}

export default Topbar
