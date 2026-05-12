import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(sessionStorage.getItem('satoken') || '')

  function setToken(tokenValue: string) {
    token.value = tokenValue
    sessionStorage.setItem('satoken', tokenValue)
  }

  function clearToken() {
    token.value = ''
    sessionStorage.removeItem('satoken')
  }

  function isLoggedIn(): boolean {
    return !!token.value
  }

  return { token, setToken, clearToken, isLoggedIn }
})
