import request, { PageParams, PageResponse } from './index'

// 小说数据接口
export interface Novel {
  ID: number
  NovelTitle: string
  Number: number
  Author: string
  Type: number
  CreateTime?: string
  UpdateTime?: string
}

// 小说查询参数
export interface NovelQueryParams extends PageParams {
  novelTitle?: string
  number?: string | number
  author?: string
  type?: number
}

// 小说表单数据
export interface NovelFormData {
  NovelTitle: string
  Number: number
  Author: string
  Type: number
}

// 获取小说列表
export const getNovels = (params: NovelQueryParams): Promise<PageResponse<Novel>> => {
  return request({
    url: '/novels',
    method: 'get',
    params
  })
}

// 根据ID获取小说详情
export const getNovelById = (id: number): Promise<{ data: Novel }> => {
  return request({
    url: `/novels/${id}`,
    method: 'get'
  })
}

// 添加小说
export const addNovel = (data: NovelFormData): Promise<{ message: string }> => {
  return request({
    url: '/novels',
    method: 'post',
    data
  })
}

// 更新小说
export const updateNovel = (id: number, data: NovelFormData): Promise<{ message: string }> => {
  return request({
    url: `/novels/${id}`,
    method: 'put',
    data
  })
}

// 删除小说
export const deleteNovel = (id: number): Promise<{ message: string }> => {
  return request({
    url: `/novels/${id}`,
    method: 'delete'
  })
}

// 批量添加小说
export const batchAddNovels = (data: NovelFormData[]): Promise<{ message: string }> => {
  return request({
    url: '/novels/batch',
    method: 'post',
    data
  })
}

// 批量删除小说
export const batchDeleteNovels = (ids: number[]): Promise<{ message: string }> => {
  return request({
    url: '/novels/batch',
    method: 'delete',
    data: { ids }
  })
}

// 检查小说是否存在
export const checkNovel = (params: { number: number; novelTitle: string }): Promise<{ exists: boolean }> => {
  return request({
    url: '/checknovel',
    method: 'get',
    params
  })
} 