import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function Inventory() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [movements, setMovements] = useState<any[]>([])

  async function loadStock() {
    setLoading(true)
    try {
      const res = await api.get('/inventory/stock')
      setStocks(res.data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadStock() }, [])

  async function loadMovements(productId: string) {
    setSelectedProduct(productId)
    try {
      const res = await api.get(`/inventory/movements?productId=${productId}&days=180`)
      setMovements(res.data)
    } catch (err) { console.error(err) }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <div>
            <button onClick={loadStock} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Stock Balances</div>
            {loading ? <div>Loading...</div> : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b"><th className="p-2">Product</th><th className="p-2">Warehouse</th><th className="p-2">Qty</th><th className="p-2">Action</th></tr>
                </thead>
                <tbody>
                  {stocks.map(s => (
                    <tr key={`${s.productId}-${s.warehouseId}`} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-2">{s.productName}</td>
                      <td className="p-2">{s.warehouseId}</td>
                      <td className="p-2">{Number(s.quantity).toFixed(3)}</td>
                      <td className="p-2"><button onClick={() => loadMovements(s.productId)} className="text-blue-600">Movements</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="col-span-1 bg-white dark:bg-gray-800 rounded shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Stock Movements</div>
            {selectedProduct ? (
              <div>
                <div className="text-sm mb-2">Product: {selectedProduct}</div>
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {movements.map((m: any, idx: number) => (
                    <li key={idx} className="border rounded p-2">
                      <div className="text-sm">{new Date(m.date).toLocaleString()}</div>
                      <div className="text-sm">Type: {m.type}</div>
                      <div className="text-sm">Qty: {m.qty}</div>
                      <div className="text-sm">Ref: {m.ref}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : <div className="text-sm text-gray-500">Select a product to view movements</div>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
