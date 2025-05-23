import request from './index'

// 设置数据接口
export interface Setting {
  Key: string
  Value: string
  Desc?: string
}

// 获取所有设置
export const getSettings = (): Promise<{ data: Setting[] }> => {
  return request({
    url: '/settings',
    method: 'get'
  })
}

// 根据Key获取单个设置
export const getSettingByKey = (key: string): Promise<{ data: Setting }> => {
  return request({
    url: `/settings/${key}`,
    method: 'get'
  })
}

// 获取当前赛季号
export const getCurrentSeason = (): Promise<{ data: Setting }> => {
  return request({
    url: '/settings/competition_number',
    method: 'get'
  })
}

// 添加设置
export const addSetting = (data: Setting): Promise<{ message: string }> => {
  return request({
    url: '/settings',
    method: 'post',
    data
  })
}

// 更新设置
export const updateSetting = (key: string, data: { value: string; desc?: string }): Promise<{ message: string }> => {
  return request({
    url: `/settings/${key}`,
    method: 'put',
    data
  })
}

// 删除设置
export const deleteSetting = (key: string): Promise<{ message: string }> => {
  return request({
    url: `/settings/${key}`,
    method: 'delete'
  })
} 