import request, { PageParams, PageResponse } from './index'

// 评论数据接口
export interface Comment {
  ID: number
  MsgId?: string
  WxNickName: string
  Number: number
  NovelTitle: string
  NovelType: number
  CommentText: string
  CreateTime: string
  UpdateTime?: string
}

// 评论查询参数
export interface CommentQueryParams extends PageParams {
  wxNickName?: string
  novelTitle?: string
  number?: string | number
  type?: number
  startTime?: string
  endTime?: string
}

// 评论表单数据（添加时使用）
export interface CommentFormData {
  WxNickName: string
  NovelTitle: string
  CommentText: string
  // 注意：Number和NovelType由系统自动赋值，不需要用户输入
}

// 评论编辑数据（编辑时使用）
export interface CommentEditData {
  WxNickName: string
  CommentText: string
}

// 获取评论列表
export const getComments = (params: CommentQueryParams): Promise<PageResponse<Comment>> => {
  return request({
    url: '/comments',
    method: 'get',
    params
  })
}

// 根据ID获取评论详情
export const getCommentById = (id: number): Promise<{ data: Comment }> => {
  return request({
    url: `/comments/${id}`,
    method: 'get'
  })
}

// 添加评论（系统自动判断类型和届数）
export const addComment = (data: CommentFormData): Promise<{ message: string }> => {
  return request({
    url: '/addcomments',
    method: 'post',
    data
  })
}

// 更新评论（只能修改昵称和内容）
export const updateComment = (id: number, data: CommentEditData): Promise<{ message: string }> => {
  return request({
    url: `/comments/${id}`,
    method: 'put',
    data
  })
}

// 删除评论
export const deleteComment = (id: number): Promise<{ message: string }> => {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}

// 批量删除评论
export const batchDeleteComments = (ids: number[]): Promise<{ message: string }> => {
  return request({
    url: '/comments/batch',
    method: 'delete',
    data: { ids }
  })
}

// 检查小说标题是否存在并获取类型信息
export const checkNovelTitle = (novelTitle: string): Promise<{ 
  exists: boolean; 
  type?: number; 
  number?: number;
  message?: string;
}> => {
  return request({
    url: '/checknovel',
    method: 'get',
    params: { novelTitle }
  })
} 