import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { useRouter } from 'next/router'

export default function EditProduct() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const [model, setModel] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!id) return
    api.get(`/products/${id}`).then(r => setModel(r.data))
  }, [id])

  const save = async () => {
    await api.put(`/products/${id}`, { ...model, id })
    router.push('/products')
  }

  const upload = async () => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.post(`/products/${id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setModel((m: any) => ({ ...m, imageUrl: res.data.url }))
  }

  if (!model) return <Layout><div className="p-6">Loading...</div></Layout>

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
        <div className="space-y-2">
          <input value={model.sku || ''} onChange={e => setModel({ ...model, sku: e.target.value })} className="w-full border px-2 py-1" />
          <input value={model.name || ''} onChange={e => setModel({ ...model, name: e.target.value })} className="w-full border px-2 py-1" />
          <input type="number" value={model.price || 0} onChange={e => setModel({ ...model, price: Number(e.target.value) })} className="w-full border px-2 py-1" />
          <div className="flex items-center gap-2">
            <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
            <button onClick={upload} className="px-3 py-1 bg-gray-200 rounded">Upload Image</button>
          </div>
          {model.imageUrl && <img src={model.imageUrl} className="h-24" />}
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
            <button onClick={() => router.push('/products')} className="px-3 py-1 bg-gray-200 rounded">Back</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
