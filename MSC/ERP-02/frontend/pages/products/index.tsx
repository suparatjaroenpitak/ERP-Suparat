import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import Link from 'next/link'

type Product = {
  id: string
  sku: string
  name: string
  price: number
  imageUrl?: string
}

export default function ProductsPage() {
  const [list, setList] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 20

  const fetch = async () => {
    const res = await api.get(`/products?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`)
    setList(res.data)
  }

  useEffect(() => { fetch() }, [page])

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Link href="/products/create" className="px-3 py-1 bg-blue-600 text-white rounded">New Product</Link>
        </div>
        <div className="mb-4 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU" className="border rounded px-2 py-1" />
          <button onClick={() => { setPage(1); fetch() }} className="px-3 py-1 bg-gray-200 rounded">Search</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th className="p-2">SKU</th><th className="p-2">Name</th><th className="p-2">Price</th><th className="p-2">Image</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.price}</td>
                  <td className="p-2">{p.imageUrl ? <img src={p.imageUrl} alt="" className="h-8" /> : '-'}</td>
                  <td className="p-2"><Link href={`/products/${p.id}`} className="text-blue-600">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
          <div className="px-3 py-1">Page {page}</div>
          <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      </div>
    </Layout>
  )
}
