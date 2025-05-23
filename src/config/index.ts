// 应用配置
export const APP_CONFIG = {
  title: '小说管理系统',
  version: '1.0.0',
  author: 'Admin'
}

// 分页配置
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
}

// 小说类型定义
export const NOVEL_TYPES = [
  { label: '正文', value: 1, color: 'primary' },
  { label: '彩蛋', value: 2, color: 'warning' }
]

// 获取小说类型标签
export const getNovelTypeLabel = (type: number): string => {
  const novelType = NOVEL_TYPES.find(item => item.value === type)
  return novelType ? novelType.label : '未知'
}

// 获取小说类型颜色
export const getNovelTypeColor = (type: number): string => {
  const novelType = NOVEL_TYPES.find(item => item.value === type)
  return novelType ? novelType.color : 'default'
}

// API 基础配置
export const API_CONFIG = {
  baseURL: '/api',
  timeout: 10000
}

// 表格配置
export const TABLE_CONFIG = {
  stripe: true,
  border: true,
  size: 'default',
  showOverflowTooltip: true
}

// 对话框配置
export const DIALOG_CONFIG = {
  destroyOnClose: true,
  closeOnClickModal: false,
  closeOnPressEscape: true
} 