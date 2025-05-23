/**
 * 应用配置
 */

// API基础URL - 从环境变量获取，如果没有则使用默认值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 应用标题
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || '小说评论管理系统';

// 应用版本
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// 是否为开发环境
export const IS_DEV = import.meta.env.DEV;

// 是否启用调试
export const DEBUG = import.meta.env.VITE_DEBUG === 'true' || IS_DEV;

// 分页配置
export const PAGINATION = {
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 10,
};

// 小说类型
export const NOVEL_TYPES = [
  { label: '全部', value: 0 },
  { label: '正文', value: 1 },
  { label: '彩蛋', value: 2 },
];

// 主题色
export const THEME = {
  PRIMARY: '#409EFF',
  SUCCESS: '#67C23A',
  WARNING: '#E6A23C',
  DANGER: '#F56C6C',
  INFO: '#909399',
};

// 请求超时时间 (毫秒)
export const REQUEST_TIMEOUT = 15000;

// 开发环境配置
export const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api',
  MOCK_DELAY: 500,
};

// 生产环境配置
export const PROD_CONFIG = {
  API_BASE_URL: '/api',
};
