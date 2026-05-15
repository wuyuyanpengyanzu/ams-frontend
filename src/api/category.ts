import request from '@/utils/request'

export function getCategoryList(): Promise<AssetCategory[]> {
  return request.get('/asset/category/list')
}

export function createCategory(params: { categoryName: string; parentId?: number }): Promise<void> {
  return request.post('/asset/category', params)
}

export function updateCategory(id: number, params: { categoryName: string; parentId?: number }): Promise<void> {
  return request.put(`/asset/category/${id}`, params)
}

export function deleteCategory(id: number): Promise<void> {
  return request.delete(`/asset/category/${id}`)
}
