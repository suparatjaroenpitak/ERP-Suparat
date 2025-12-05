import React, { useState } from 'react'
import api from '../services/api'

export default function CustomerCreditCard() {
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null as null | { outstanding: number; creditLimit: number; availableCredit: number })

  async function load() {
    if (!customerId) return
    setLoading(true)
    try {
      const res = await api.get(`/api/ar/customer/${customerId}/summary`)
      setSummary(res.data)
    } catch (err) {
      console.error(err)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
      <h2 className="text-lg font-medium mb-2">Customer AR Summary</h2>
      <div className="flex gap-2 mb-3">
        <input className="border px-2 py-1 rounded flex-1" placeholder="CustomerId (GUID)" value={customerId} onChange={e => setCustomerId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={load} disabled={loading}>Load</button>
      </div>
      {loading && <div>Loading…</div>}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900 rounded">
            <div className="text-sm">Outstanding</div>
            <div className="text-2xl font-semibold">{summary.outstanding.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
            <div className="text-sm">Credit Limit</div>
            <div className="text-2xl font-semibold">{summary.creditLimit.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
            <div className="text-sm">Available</div>
            <div className="text-2xl font-semibold">{summary.availableCredit.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
