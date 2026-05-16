import request from '@/utils/request'

export function getRoleList(): Promise<RoleInfo[]> {
  return request.get('/role/list')
}

export function createRole(params: RoleParams): Promise<void> {
  return request.post('/role', params)
}

export function updateRole(id: number, params: RoleParams): Promise<void> {
  return request.put(`/role/${id}`, params)
}

export function getRoleById(id: number): Promise<RoleInfo & { menuIds: number[] }> {
  return request.get(`/role/${id}`)
}

export function deleteRole(id: number): Promise<void> {
  return request.delete(`/role/${id}`)
}
