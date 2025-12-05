import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function StockMovementReport() {
  const [productId, setProductId] = useState('')
  const { data, isFetching, refetch } = useQuery(['stock-movements', productId], async () => {
    const params: any = {}
    if (productId) params.productId = productId
    const res = await api.get('/api/report/stock-movements', { params })
    return res.data
  }, { enabled: false })

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h3 className="text-lg font-medium mb-2">Stock Movements</h3>
      <div className="flex gap-2 mb-3">
        <input className="border px-2 py-1 rounded flex-1" placeholder="ProductId (GUID)" value={productId} onChange={e => setProductId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => refetch()}>Load</button>
      </div>
      {isFetching && <div>Loading…</div>}
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Date</th><th>Product</th><th>Type</th><th className="text-right">Qty</th><th className="text-right">UnitCost</th></tr></thead>
        <tbody>
          {data?.map((l:any) => (
            <tr key={`${l.productId}-${l.date}`}><td>{new Date(l.date).toLocaleString()}</td><td>{l.productName}</td><td>{l.type}</td><td className="text-right">{l.quantity}</td><td className="text-right">{l.unitCost?.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
