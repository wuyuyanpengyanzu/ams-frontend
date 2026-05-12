import request from '@/utils/request'

/** 登录，返回 TokenInfo（已由拦截器解包 Result） */
export function login(params: LoginParams): Promise<TokenInfo> {
  return request.post('/auth/login', params)
}
