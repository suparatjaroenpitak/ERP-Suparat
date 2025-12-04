import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pos', label: 'POS' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/purchasing', label: 'Purchasing' },
  { href: '/sales', label: 'Sales' },
  { href: '/accounting', label: 'Accounting' },
  { href: '/reports', label: 'Reports' },
  { href: '/admin', label: 'Admin' },
]

const Sidebar: React.FC = () => {
  const router = useRouter()

  return (
    <aside className="w-[var(--sidebar-width)] bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen flex-shrink-0">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold">ERP</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = router.pathname === it.href
            return (
              <li key={it.href}>
                <Link href={it.href} className={`block rounded px-3 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  {it.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
