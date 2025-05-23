import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 基础URL，可根据环境变量配置
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在请求发送前做一些处理
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做处理
    const { data, status } = response
    
    if (status === 200) {
      return data
    } else {
      ElMessage.error('请求失败')
      return Promise.reject(new Error('请求失败'))
    }
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理不同的错误状态
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request

// 定义通用响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
}

// 定义分页参数接口
export interface PageParams {
  page?: number
  pageSize?: number
  [key: string]: any
}

// 定义分页响应接口
export interface PageResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
} 