import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(sessionStorage.getItem('satoken') || '')
  const permissions = ref<string[]>([])

  function setToken(tokenValue: string) {
    token.value = tokenValue
    sessionStorage.setItem('satoken', tokenValue)
  }

  function setPermissions(perms: string[]) {
    permissions.value = perms
  }

  function clearToken() {
    token.value = ''
    permissions.value = []
    sessionStorage.removeItem('satoken')
  }

  function isLoggedIn(): boolean {
    return !!token.value
  }

  return { token, permissions, setToken, setPermissions, clearToken, isLoggedIn }
})
