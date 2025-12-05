import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

type Product = {
  id: string
  sku: string
  name: string
  price: number
  imageUrl?: string
  categoryName?: string
}

type CartItem = {
  product: Product
  qty: number
  discountPercent: number
  discountAmount: number
}

function normalizeProduct(p: any): Product {
  return {
    id: p.id ?? p.Id,
    sku: p.sku ?? p.SKU,
    name: p.name ?? p.Name,
    price: p.price ?? p.Price ?? 0,
    imageUrl: p.imageUrl ?? p.ImageUrl ?? p.imageUrl ?? null,
    categoryName: p.categoryName ?? p.CategoryName ?? null,
  }
}

export default function POSPage() {
  const [query, setQuery] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone?: string; points?: number } | null>(null)
  const [redeemPoints, setRedeemPoints] = useState<number>(0)
  const [results, setResults] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 50
  const searchTimeout = useRef<number | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // focus scanner input on mount so barcode scanners send keystrokes here
    barcodeInputRef.current?.focus()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!customerQuery) return setCustomerResults([])
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/customers?q=${encodeURIComponent(customerQuery)}`)
        setCustomerResults(res.data)
      } catch (err) { console.error(err) }
    }, 250)
    return () => clearTimeout(t)
  }, [customerQuery])

  useEffect(() => {
    // derive categories from results
    const cats = Array.from(new Set(results.map(r => r.categoryName).filter(Boolean))) as string[]
    setCategories(cats)
    if (activeCategory && !cats.includes(activeCategory)) setActiveCategory(null)
  }, [results])

  function fetchProducts(q = query, p = page) {
    // debounce
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
    searchTimeout.current = window.setTimeout(async () => {
      try {
        const res = await api.get(`/products?page=${p}&pageSize=${pageSize}&search=${encodeURIComponent(q)}`)
        const data = (res.data || []).map((x: any) => normalizeProduct(x))
        setResults(data)
      } catch (err) {
        console.error(err)
      }
    }, 200)
  }

  function addToCart(product: Product, qty = 1) {
    setCart((c) => {
      const found = c.find(ci => ci.product.id === product.id)
      if (found) {
        return c.map(ci => ci.product.id === product.id ? { ...ci, qty: ci.qty + qty } : ci)
      }
      return [{ product, qty, discountPercent: 0, discountAmount: 0 }, ...c]
    })
  }

  function removeFromCart(productId: string) {
    setCart(c => c.filter(ci => ci.product.id !== productId))
  }

  function updateCartItem(productId: string, updater: (ci: CartItem) => CartItem) {
    setCart(c => c.map(ci => ci.product.id === productId ? updater(ci) : ci))
  }

  function handleBarcodeEnter(value: string) {
    const code = value.trim()
    if (!code) return
    // try to find in current results first by SKU
    const found = results.find(r => (r.sku || '').toString() === code || (r.id || '').toString() === code)
    if (found) { addToCart(found); return }
    // else, query backend by search with exact SKU
    api.get(`/products?page=1&pageSize=1&search=${encodeURIComponent(code)}`).then(r => {
      const data = (r.data || []).map((x: any) => normalizeProduct(x))
      if (data.length > 0) addToCart(data[0])
    }).catch(console.error)
  }

  const subtotal = cart.reduce((s, ci) => s + ci.product.price * ci.qty, 0)
  const totalDiscount = cart.reduce((s, ci) => s + ci.discountAmount + (ci.product.price * ci.qty * ci.discountPercent / 100), 0)
  const total = subtotal - totalDiscount
  // offline syncing state
  const [syncing, setSyncing] = useState(false)

  async function saveDraftOffline() {
    try {
      const id = `draft-${Date.now()}`
      const payload = {
        id,
        createdAt: new Date().toISOString(),
        items: cart.map(ci => ({ productId: ci.product.id, qty: ci.qty, unitPrice: ci.product.price, discountPercent: ci.discountPercent, discountAmount: ci.discountAmount })),
        totalAmount: subtotal,
        totalDiscount: totalDiscount
      }
      const offline = await import('../lib/offline')
      await offline.default.saveDraft(payload)
      alert('Draft saved offline')
    } catch (err) {
      console.error(err)
      alert('Failed to save draft offline')
    }
  }

  async function syncDrafts() {
    setSyncing(true)
    const offline = await import('../lib/offline')
    const drafts = await offline.default.listDrafts()
    for (const d of drafts) {
      try {
        const body = {
          draft: true,
          userId: null,
          items: d.items.map((it: any) => ({ productId: it.productId, quantity: it.qty, unitPrice: it.unitPrice, discountPercent: it.discountPercent ?? 0, discountAmount: it.discountAmount ?? 0 })),
          totalAmount: d.totalAmount,
          totalDiscount: d.totalDiscount
        }
        const res = await api.post('/pos/checkout', body)
        if (res.status === 200) {
          await offline.default.removeDraft(d.id)
        }
      } catch (err) {
        console.error('sync draft failed', d, err)
      }
    }
    setSyncing(false)
    alert('Sync complete')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen grid grid-cols-3 gap-4 p-4">
        {/* Left: product searching and categories */}
        <div className="col-span-2 flex flex-col bg-white dark:bg-gray-800 rounded shadow p-4">
          <div className="flex items-center gap-3">
            <input ref={barcodeInputRef} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const t = (e.target as HTMLInputElement).value
                (e.target as HTMLInputElement).value = ''
                handleBarcodeEnter(t)
              }
            }} placeholder="Scan barcode here (auto-focus)" className="border px-2 py-2 flex-1" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); fetchProducts(e.target.value, 1) }} placeholder="Search name or SKU" className="border px-2 py-2 w-96" />
            <button onClick={() => fetchProducts(query, 1)} className="px-3 py-2 bg-gray-200 rounded">Search</button>
          </div>

            <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto py-2">
              <button onClick={() => setActiveCategory(null)} className={`px-3 py-1 rounded ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>All</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 border rounded bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-semibold mb-2">Select Member</div>
            <div className="flex gap-2">
              <input value={customerQuery} onChange={e => setCustomerQuery(e.target.value)} placeholder="Search member by name/phone" className="border px-2 py-1 flex-1" />
              <div className="w-40">
                <button onClick={() => { setCustomerQuery(''); setCustomerResults([]) }} className="px-3 py-1 bg-gray-200 rounded">Clear</button>
              </div>
            </div>
            <div className="mt-2">
              {customerResults.map(c => (
                <div key={c.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" onClick={() => { setSelectedCustomer(c); setCustomerResults([]); setCustomerQuery('') }}>
                  <div className="flex justify-between"><div>{c.name} {c.phone ? `(${c.phone})` : ''}</div><div className="text-sm text-gray-500">{c.pointsBalance ?? c.points ?? 0} pts</div></div>
                </div>
              ))}
            </div>
            {selectedCustomer && <div className="mt-2 text-sm">Selected: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.points ?? 0} pts)</div>}
            <div className="mt-2 flex gap-2 items-center">
              <input type="number" value={redeemPoints} min={0} onChange={e => setRedeemPoints(Number(e.target.value) || 0)} className="w-32 border px-2 py-1" />
              <div className="text-sm text-gray-500">Redeem points (1 point = 1 ฿)</div>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-auto">
            <div className="grid grid-cols-4 gap-3">
              {results.filter(r => !activeCategory || r.categoryName === activeCategory).map(p => (
                <div key={p.id} className="border rounded p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-14" /> : <div className="text-sm text-gray-400">No Image</div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.sku}</div>
                      <div className="mt-1 text-lg">{p.price.toFixed(2)}</div>
                    </div>
                  </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => addToCart(p, 1)} className="px-3 py-1 bg-green-600 text-white rounded">Add 1</button>
                          <button onClick={() => addToCart(p, 5)} className="px-3 py-1 bg-green-500 text-white rounded">Add 5</button>
                        </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: cart */}
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Cart</h2>
          <div className="flex-1 overflow-auto">
            {cart.length === 0 && <div className="text-sm text-gray-500">Cart is empty</div>}
            <ul className="space-y-2">
              {cart.map(ci => (
                <li key={ci.product.id} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{ci.product.name}</div>
                      <div className="text-sm text-gray-500">{ci.product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg">{(ci.product.price * ci.qty - ci.discountAmount - (ci.product.price * ci.qty * ci.discountPercent / 100)).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{ci.product.price.toFixed(2)} x {ci.qty}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs">Qty</label>
                      <input type="number" value={ci.qty} min={1} onChange={e => updateCartItem(ci.product.id, old => ({ ...old, qty: Math.max(1, Number(e.target.value) || 1) }))} className="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label className="text-xs">Discount %</label>
                      <input type="number" value={ci.discountPercent} min={0} max={100} onChange={e => updateCartItem(ci.product.id, old => ({ ...old, discountPercent: Number(e.target.value) || 0 }))} className="w-full border px-2 py-1" />
                    </div>
                    <div>
                      <label className="text-xs">Discount ฿</label>
                      <input type="number" value={ci.discountAmount} min={0} onChange={e => updateCartItem(ci.product.id, old => ({ ...old, discountAmount: Number(e.target.value) || 0 }))} className="w-full border px-2 py-1" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateCartItem(ci.product.id, old => ({ ...old, qty: old.qty + 1 }))} className="px-2 py-1 bg-gray-200 rounded">+1</button>
                    <button onClick={() => updateCartItem(ci.product.id, old => ({ ...old, qty: Math.max(1, old.qty - 1) }))} className="px-2 py-1 bg-gray-200 rounded">-1</button>
                    <button onClick={() => removeFromCart(ci.product.id)} className="px-2 py-1 bg-red-600 text-white rounded">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <div className="flex justify-between"><div>Subtotal</div><div>{subtotal.toFixed(2)}</div></div>
            <div className="flex justify-between"><div>Discount</div><div>-{totalDiscount.toFixed(2)}</div></div>
            <div className="flex justify-between font-semibold text-lg mt-2"><div>Total</div><div>{total.toFixed(2)}</div></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={async () => {
              try {
                const payload = {
                  userId: null,
                  items: cart.map(ci => ({ productId: ci.product.id, quantity: ci.qty, unitPrice: ci.product.price, discountPercent: ci.discountPercent, discountAmount: ci.discountAmount })),
                  totalAmount: subtotal,
                  totalDiscount: totalDiscount,
                  draft: false
                }
                const res = await api.post('/pos/checkout', payload)
                alert('Checkout success: ' + res.data.orderId)
                setCart([])
              } catch (err) {
                console.error(err)
                alert('Checkout failed')
              }
            }} className="flex-1 px-3 py-2 bg-green-600 text-white rounded">Checkout</button>

            <button onClick={() => setCart([])} className="px-3 py-2 bg-gray-200 rounded">Clear</button>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={saveDraftOffline} className="px-3 py-2 bg-yellow-500 text-white rounded">Save Draft Offline</button>
            <button onClick={syncDrafts} className="px-3 py-2 bg-blue-600 text-white rounded">Sync Drafts {syncing ? '(syncing...)' : ''}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
