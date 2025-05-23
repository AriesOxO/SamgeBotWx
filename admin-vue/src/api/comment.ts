import request from './index';

// 评论接口类型定义
export interface CommentQuery {
  page: number;
  pageSize: number;
  wxNickName?: string;
  novelTitle?: string;
  number?: string | number;
  startTime?: string;
  endTime?: string;
  type?: number; // 新增：文章类型过滤（1-正文，2-彩蛋）
}

export interface CommentData {
  ID: number;
  WxNickName: string;
  NovelTitle: string;
  CommentText: string;
  Number: number;
  Type: number; // 新增：文章类型
  CreateTime: string;
}

export interface CommentResponse {
  data: CommentData[];
  total: number;
}

export interface AddCommentData {
  WxNickName: string;
  NovelTitle: string;
  Number: number;
  CommentText: string;
  Type: number; // 新增：文章类型
}

export interface UpdateCommentData {
  WxNickName: string;
  CommentText: string;
}

// 获取评论列表
export function getComments(query: CommentQuery) {
  return request({
    url: '/comments',
    method: 'get',
    params: query,
  });
}

// 添加评论
export function addComment(data: AddCommentData) {
  return request({
    url: '/addcomments',
    method: 'post',
    data,
  });
}

// 更新评论
export function updateComment(id: number, data: UpdateCommentData) {
  return request({
    url: `/comments/${id}`,
    method: 'put',
    data,
  });
}

// 删除评论
export function deleteComment(id: number) {
  return request({
    url: `/comments/${id}`,
    method: 'delete',
  });
}

// 检查小说标题是否合法
export function checkNovel(number: string | number, novelTitle: string) {
  return request({
    url: '/checknovel',
    method: 'get',
    params: {
      number,
      novelTitle: `《${novelTitle}》`,
    },
  });
}
