import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const activeRole = ref(localStorage.getItem('active_role') || null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    token.value = data.token
    activeRole.value = data.active_role
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('active_role', data.active_role)
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload)
    token.value = data.token
    activeRole.value = data.active_role
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('active_role', data.active_role)
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me')
    user.value = data.user
    activeRole.value = data.active_role
  }

  async function switchRole(role) {
    const { data } = await api.post('/auth/switch-role', { role })
    token.value = data.token
    activeRole.value = data.active_role
    localStorage.setItem('token', data.token)
    localStorage.setItem('active_role', data.active_role)
  }

  async function logout() {
    await api.post('/auth/logout')
    token.value = null
    user.value = null
    activeRole.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('active_role')
  }

  return { user, token, activeRole, isLoggedIn, login, register, fetchMe, switchRole, logout }
})
