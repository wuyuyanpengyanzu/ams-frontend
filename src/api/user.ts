import request from '@/utils/request'

export function getUserList(): Promise<UserVO[]> {
  return request.get('/user/list')
}

export function createUser(params: UserCreateParams): Promise<void> {
  return request.post('/user', params)
}

export function updateUser(id: number, params: UserUpdateParams): Promise<void> {
  return request.put(`/user/${id}`, params)
}

export function deleteUser(id: number): Promise<void> {
  return request.delete(`/user/${id}`)
}
