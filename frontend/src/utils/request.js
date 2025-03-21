import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // 从环境变量获取API地址
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    // 如果有token，添加到请求头
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 这里可以根据后端的响应结构进行调整
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      // 如果是401，说明token过期或无效
      if (res.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误：', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request 