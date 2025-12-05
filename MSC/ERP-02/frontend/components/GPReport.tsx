import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function GPReport() {
  const { data, isLoading } = useQuery(['gp'], async () => {
    const res = await api.get('/api/report/gp')
    return res.data
  }, { refetchInterval: 5000 })

  if (isLoading) return <div>Loading GP report…</div>

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h3 className="text-lg font-medium mb-2">GP Report (30d)</h3>
      <div className="mb-2">Total Revenue: {data?.totalRevenue?.toFixed(2)}</div>
      <div className="mb-4">Total COGS: {data?.totalCogs?.toFixed(2)}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left"><th>Product</th><th className="text-right">Revenue</th><th className="text-right">COGS</th><th className="text-right">Gross</th></tr>
        </thead>
        <tbody>
          {data?.lines?.map((l:any) => (
            <tr key={l.productId}><td>{l.productName}</td><td className="text-right">{l.revenue.toFixed(2)}</td><td className="text-right">{l.cOGS?.toFixed(2) ?? l.cogs?.toFixed(2)}</td><td className="text-right">{(l.revenue - (l.cOGS ?? l.cogs)).toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
