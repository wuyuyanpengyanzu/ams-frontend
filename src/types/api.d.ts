/** 后端统一响应体 */
interface Result<T> {
  code: number
  msg: string
  data: T
}

/** Sa-Token StpUtil.getTokenInfo() 返回结构，字段与 Java 端 Jackson 序列化一致 */
interface TokenInfo {
  tokenName: string
  tokenValue: string
  isLogin: boolean
  loginId: string
}

/** 登录请求参数 */
interface LoginParams {
  username: string
  password: string
}
