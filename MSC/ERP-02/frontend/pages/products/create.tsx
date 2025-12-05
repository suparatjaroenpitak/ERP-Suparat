import React, { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { useRouter } from 'next/router'

export default function CreateProduct() {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const router = useRouter()

  const submit = async () => {
    await api.post('/products', { sku, name, price })
    router.push('/products')
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Create Product</h1>
        <div className="space-y-2 max-w-lg">
          <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU" className="w-full border px-2 py-1" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full border px-2 py-1" />
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Price" className="w-full border px-2 py-1" />
          <div className="flex gap-2">
            <button onClick={submit} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
            <button onClick={() => router.push('/products')} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
