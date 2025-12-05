import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/auth/login', { username, password })
      const data = res.data
      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        localStorage.setItem('permissions', JSON.stringify(data.permissions || []))
        router.push('/dashboard')
      } else {
        setError('Invalid response')
      }
    } catch (err: any) {
      setError(err?.response?.data || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-900" />
          </div>
          {error && <div className="text-sm text-red-500">{String(error)}</div>}
          <div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  )
}
