import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  actions: {
    async login(email, password) {
      const response = await api.post('/login', { email, password });
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    }
  }
});
