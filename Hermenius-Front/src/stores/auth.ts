import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  fullname: string
  email: string
  phone: string
  company: string
}

const STORAGE_KEY = 'hermenius-auth'

function loadFromStorage(): { isRegistered: boolean; user: User | null } {
  if (typeof localStorage === 'undefined') {
    return { isRegistered: false, user: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { isRegistered: false, user: null }
    const parsed = JSON.parse(raw) as { user: User }
    return { isRegistered: true, user: parsed.user }
  } catch {
    return { isRegistered: false, user: null }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadFromStorage()
  const isRegistered = ref<boolean>(stored.isRegistered)
  const user = ref<User | null>(stored.user)

  const isAuthenticated = computed(() => isRegistered.value && user.value !== null)

  function register(data: User): void {
    user.value = { ...data }
    isRegistered.value = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data }))
  }

  function logout(): void {
    user.value = null
    isRegistered.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    isRegistered,
    user,
    isAuthenticated,
    register,
    logout,
  }
})
