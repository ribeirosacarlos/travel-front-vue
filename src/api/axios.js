import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      import('../store/auth').then(({ useAuthStore }) => {
        const auth = useAuthStore()
        auth.logout()
      })
    }
    return Promise.reject(err)
  }
)

export default api
