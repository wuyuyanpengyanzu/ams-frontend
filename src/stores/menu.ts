import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuTree } from '@/api/menu'

export const useMenuStore = defineStore('menu', () => {
  const tree = ref<MenuInfo[]>([])
  const loaded = ref(false)

  async function fetchMenu() {
    const data = await getMenuTree()
    tree.value = data
    loaded.value = true
    return data
  }

  return { tree, loaded, fetchMenu }
})
