import request from './index';

// 系统设置接口类型定义
export interface SettingData {
  Key: string;
  Value: string;
  Desc: string;
}

export interface SettingResponse {
  data: SettingData[];
}

export interface AddSettingData {
  Key: string;
  Value: string;
  Desc: string;
}

export interface UpdateSettingData {
  value: string;
  desc: string;
}

// 获取所有配置
export function getAllSettings() {
  return request({
    url: '/settings',
    method: 'get',
  });
}

// 获取单个配置
export function getSettingByKey(key: string) {
  return request({
    url: `/settings/${key}`,
    method: 'get',
  });
}

// 添加配置
export function addSetting(data: AddSettingData) {
  return request({
    url: '/settings',
    method: 'post',
    data,
  });
}

// 更新配置
export function updateSetting(key: string, data: UpdateSettingData) {
  return request({
    url: `/settings/${key}`,
    method: 'put',
    data,
  });
}

// 删除配置
export function deleteSetting(key: string) {
  return request({
    url: `/settings/${key}`,
    method: 'delete',
  });
}

// 获取统计数据
export function getStatistics(groupType: number, sortType: number) {
  return request({
    url: '/static',
    method: 'get',
    params: {
      groupType,
      sortType,
    },
  });
}
