import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Topbar />
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  )
}

export default Layout
