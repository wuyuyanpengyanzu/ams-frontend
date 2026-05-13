import request from '@/utils/request'

export function getMenuTree(): Promise<MenuInfo[]> {
  return request.get('/menu/tree')
}

export function createMenu(params: MenuParams): Promise<void> {
  return request.post('/menu', params)
}

export function updateMenu(id: number, params: MenuParams): Promise<void> {
  return request.put(`/menu/${id}`, params)
}

export function deleteMenu(id: number): Promise<void> {
  return request.delete(`/menu/${id}`)
}
