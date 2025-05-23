import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, DEBUG } from '@/config';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在开发环境下打印请求信息
    if (DEBUG) {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url, config.data);
    }

    // 可以在这里添加认证头等配置
    // config.headers.Authorization = `Bearer ${getToken()}`;

    return config;
  },
  (error) => {
    if (DEBUG) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 在开发环境下打印响应信息
    if (DEBUG) {
      console.log('✅ Response:', response.status, response.data);
    }

    return response.data;
  },
  (error) => {
    // 处理错误响应
    const { response } = error;

    if (DEBUG) {
      console.error('❌ Response Error:', error);
    }

    if (response) {
      // 处理不同HTTP状态码
      switch (response.status) {
        case 401:
          console.error('未授权，请重新登录');
          // 可以在这里处理登录跳转
          break;
        case 403:
          console.error('没有权限访问此资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求错误: ${response.status}`, response.data);
      }
    } else {
      console.error('网络错误或请求被取消');
    }

    return Promise.reject(error);
  }
);

export default service;

// 导出所有API
export * from './comment';
export * from './novel';
export * from './setting';
