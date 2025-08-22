import { defineStore } from 'pinia'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    // Chame isso ao iniciar o app (ex: no App.vue) para rehidratar o header
    hydrateFromStorage() {
      if (this.token) {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      }
    },

    _setSession({ token, user }) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    async login(email, password) {
      try {
        const res = await api.post('/auth/login', { email, password })

        // Garantimos que só “loga” se voltou 200 + token
        if (res.status === 200 && res.data?.token) {
          this._setSession(res.data)
          return { ok: true, data: res.data }
        }

        return { ok: false, error: 'Resposta inesperada do servidor.' }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Erro ao fazer login.'
        return { ok: false, error: msg }
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common.Authorization
    },
  },
})
