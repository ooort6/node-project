import request from '../utils/request'

// 获取公告列表
export function getNotices() {
  return request({
    url: '/notices',
    method: 'get'
  })
}

// 创建公告
export function createNotice(data) {
  return request({
    url: '/notices',
    method: 'post',
    data
  })
}

// 更新公告
export function updateNotice(id, data) {
  return request({
    url: `/notices/${id}`,
    method: 'put',
    data
  })
}

// 删除公告
export function deleteNotice(id) {
  return request({
    url: `/notices/${id}`,
    method: 'delete'
  })
} 