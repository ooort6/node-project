import request from '../utils/request'

// 获取待办事项列表
export function getTodos() {
  return request({
    url: '/todos',
    method: 'get'
  })
}

// 创建待办事项
export function createTodo(data) {
  return request({
    url: '/todos',
    method: 'post',
    data
  })
}

// 更新待办事项
export function updateTodo(id, data) {
  return request({
    url: `/todos/${id}`,
    method: 'put',
    data
  })
}

// 删除待办事项
export function deleteTodo(id) {
  return request({
    url: `/todos/${id}`,
    method: 'delete'
  })
}

// 更新待办事项状态
export function updateTodoStatus(id, completed) {
  return request({
    url: `/todos/${id}/status`,
    method: 'patch',
    data: { completed }
  })
} 