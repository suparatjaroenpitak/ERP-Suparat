import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

function usePL(from?: string, to?: string) {
  return useQuery(['pl', from, to], async () => {
    const res = await api.get('/api/report/pl', { params: { from, to } })
    return res.data
  }, { refetchInterval: 5000 }) // poll every 5s
}

function useBalance(asOf?: string) {
  return useQuery(['balance', asOf], async () => {
    const res = await api.get('/api/report/balance', { params: { asOf } })
    return res.data
  }, { refetchInterval: 5000 })
}

export default function FinancialDashboard() {
  const now = new Date().toISOString()
  const pl = usePL()
  const bal = useBalance()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Total Revenue (30d)</div>
          <div className="text-2xl font-semibold">{pl.data ? pl.data.totalRevenue.toFixed(2) : '—'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Total Expense (30d)</div>
          <div className="text-2xl font-semibold">{pl.data ? pl.data.totalExpense.toFixed(2) : '—'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Net Profit (30d)</div>
          <div className="text-2xl font-semibold">{pl.data ? (pl.data.totalRevenue - pl.data.totalExpense).toFixed(2) : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Total Assets</div>
          <div className="text-2xl font-semibold">{bal.data ? bal.data.totalAssets.toFixed(2) : '—'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Total Liabilities</div>
          <div className="text-2xl font-semibold">{bal.data ? bal.data.totalLiabilities.toFixed(2) : '—'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm">Total Equity</div>
          <div className="text-2xl font-semibold">{bal.data ? bal.data.totalEquity.toFixed(2) : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Top Revenues</h3>
          <ul className="space-y-1">
            {pl.data?.revenues?.slice(0,5).map((r:any) => (
              <li key={r.accountCode} className="flex justify-between"><span>{r.accountName}</span><span>{r.amount.toFixed(2)}</span></li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Top Expenses</h3>
          <ul className="space-y-1">
            {pl.data?.expenses?.slice(0,5).map((r:any) => (
              <li key={r.accountCode} className="flex justify-between"><span>{r.accountName}</span><span>{r.amount.toFixed(2)}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
