import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const perm = binding.value
    if (perm && !userStore.permissions.includes(perm)) {
      el.parentNode?.removeChild(el)
    }
  },
}
