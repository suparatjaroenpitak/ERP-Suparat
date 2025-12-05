import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function AgingArReport() {
  const { data, isLoading } = useQuery(['aging-ar'], async () => {
    const res = await api.get('/api/report/aging-ar')
    return res.data
  }, { refetchInterval: 10000 })

  if (isLoading) return <div>Loading Aging AR…</div>

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h3 className="text-lg font-medium mb-2">Aging AR</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left"><th>Customer</th><th className="text-right">Outstanding</th><th>0-30</th><th>31-60</th><th>61-90</th><th>&gt;90</th></tr>
        </thead>
        <tbody>
          {data?.map((c:any) => (
            <tr key={c.customerId}><td>{c.customerName || c.customerId}</td><td className="text-right">{c.outstanding.toFixed(2)}</td><td>{c.buckets[0].amount.toFixed(2)}</td><td>{c.buckets[1].amount.toFixed(2)}</td><td>{c.buckets[2].amount.toFixed(2)}</td><td>{c.buckets[3].amount.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
