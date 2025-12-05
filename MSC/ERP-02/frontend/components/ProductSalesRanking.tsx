import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function ProductSalesRanking() {
  const { data, isLoading } = useQuery(['product-sales-ranking'], async () => {
    const res = await api.get('/api/report/product-sales-ranking')
    return res.data
  }, { refetchInterval: 5000 })

  if (isLoading) return <div>Loading product ranking…</div>

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h3 className="text-lg font-medium mb-2">Product Sales Ranking (30d)</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Product</th><th className="text-right">Quantity</th><th className="text-right">Revenue</th></tr></thead>
        <tbody>
          {data?.map((p:any) => (
            <tr key={p.productId}><td>{p.productName}</td><td className="text-right">{p.quantity}</td><td className="text-right">{p.revenue.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
