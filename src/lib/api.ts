// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
})

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('idToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, error => Promise.reject(error))

// Response interceptor
api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('idToken')
      window.location.href = '/login'
    }
    if (error.response?.status === 500) {
      alert('Error del servidor.')
    }
    return Promise.reject(error)
  }
)

export default api