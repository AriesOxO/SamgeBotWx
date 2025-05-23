import request from './index';

// 小说接口类型定义
export interface NovelQuery {
  page: number;
  pageSize: number;
  novelTitle?: string;
  number?: string | number;
  author?: string;
  type?: number; // 新增：文章类型过滤（1-正文，2-彩蛋）
}

export interface NovelData {
  ID: number;
  NovelTitle: string;
  Number: number;
  Author: string;
  Type: number; // 新增：文章类型（1-正文，2-彩蛋）
  CreateTime: string;
}

export interface NovelResponse {
  data: NovelData[];
  total: number;
}

export interface AddNovelData {
  NovelTitle: string;
  Number: number;
  Author: string;
  Type: number; // 新增：文章类型
}

// 获取小说列表
export function getNovels(query: NovelQuery) {
  return request({
    url: '/novels',
    method: 'get',
    params: query,
  });
}

// 获取小说详情
export function getNovelById(id: number) {
  return request({
    url: `/novels/${id}`,
    method: 'get',
  });
}

// 添加小说
export function addNovel(data: AddNovelData) {
  return request({
    url: '/novels',
    method: 'post',
    data,
  });
}

// 批量添加小说
export function batchAddNovels(data: AddNovelData[]) {
  return request({
    url: '/novels/batch',
    method: 'post',
    data,
  });
}

// 更新小说
export function updateNovel(id: number, data: AddNovelData) {
  return request({
    url: `/novels/${id}`,
    method: 'put',
    data,
  });
}

// 删除小说
export function deleteNovel(id: number) {
  return request({
    url: `/novels/${id}`,
    method: 'delete',
  });
}
