import React from 'react'
import Layout from '../components/Layout'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

type DailyPoint = { date: string; total: number }
type TopProduct = { productId: string; productName: string; quantity: number; revenue: number }

async function fetchSales(days = 30) {
  const res = await api.get(`/report/sales/daily?days=${days}&top=5`)
  return res.data
}

function LineChart({ points }: { points: DailyPoint[] }) {
  if (!points || points.length === 0) return <div className="p-4">No data</div>
  const values = points.map(p => Number(p.total))
  const max = Math.max(...values, 1)
  const width = 600
  const height = 200
  const step = width / Math.max(1, points.length - 1)

  const path = points.map((p, i) => {
    const x = i * step
    const y = height - (Number(p.total) / max) * height
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery(['salesReport', 30], () => fetchSales(30), { refetchInterval: 5000 })

  if (isLoading) return <Layout><div className="p-6">Loading dashboard...</div></Layout>
  if (error) return <Layout><div className="p-6">Failed to load dashboard</div></Layout>

  const report = data as any
  const daily: DailyPoint[] = report.daily?.map((d: any) => ({ date: d.date, total: Number(d.total) })) ?? []
  const top: TopProduct[] = report.topProducts ?? []
  const totalSales = Number(report.totalSales ?? 0)

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Sales (last 30 days)</div>
              <div className="text-lg font-semibold">{totalSales.toFixed(2)}</div>
            </div>
            <LineChart points={daily} />
          </div>

          <div className="col-span-1 bg-white dark:bg-gray-800 rounded shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Top Products</div>
            <ul className="space-y-2">
              {top.map(tp => (
                <li key={tp.productId} className="flex justify-between">
                  <div>
                    <div className="font-medium">{tp.productName}</div>
                    <div className="text-xs text-gray-500">Qty: {tp.quantity}</div>
                  </div>
                  <div className="font-semibold">{Number(tp.revenue).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
