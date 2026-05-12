import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000,
})

// 请求拦截器：注入 Sa-Token header
request.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('satoken')
    if (token) {
      config.headers['satoken'] = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：解包 Result<T>
request.interceptors.response.use(
  (response) => {
    const res = response.data as Result<unknown>

    if (res.code === 200) {
      return res.data as unknown as typeof response
    }

    if (res.code === 401) {
      sessionStorage.removeItem('satoken')
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(new Error(res.msg || '未登录'))
    }

    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || '请求失败'))
  },
  (error) => {
    ElMessage.error('网络异常，请稍后重试')
    return Promise.reject(error)
  },
)

export default request
