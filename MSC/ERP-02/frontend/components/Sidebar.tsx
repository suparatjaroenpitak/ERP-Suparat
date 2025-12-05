import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

type NavItem = { href: string; label: string; permission?: string }

const items: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', permission: 'access_dashboard' },
  { href: '/pos', label: 'POS', permission: 'access_pos' },
  { href: '/inventory', label: 'Inventory', permission: 'access_inventory' },
  { href: '/purchasing', label: 'Purchasing', permission: 'access_purchasing' },
  { href: '/sales', label: 'Sales', permission: 'access_sales' },
  { href: '/accounting', label: 'Accounting', permission: 'access_accounting' },
  { href: '/reports', label: 'Reports', permission: 'access_reports' },
  { href: '/admin', label: 'Admin', permission: 'access_admin' },
]

const Sidebar: React.FC = () => {
  const router = useRouter()

  // permissions stored as JSON array in localStorage by login page
  let perms: string[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('permissions')
      if (raw) perms = JSON.parse(raw)
    } catch {
      perms = []
    }
  }

  return (
    <aside className="w-[var(--sidebar-width)] bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen flex-shrink-0">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold">ERP</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = router.pathname === it.href
            const allowed = it.permission ? perms.includes(it.permission) : true
            return (
              <li key={it.href}>
                {allowed ? (
                  <Link href={it.href} className={`block rounded px-3 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    {it.label}
                  </Link>
                ) : (
                  <div className="block rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed">{it.label}</div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
