import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// attach token if available
api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      cfg.headers = cfg.headers ?? {}
      cfg.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return cfg
})

export default api
