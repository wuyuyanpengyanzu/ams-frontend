import request from '@/utils/request'

/** 创建盘点任务 */
export function createInventoryTask(params: InventoryTaskParams): Promise<{ taskId: number; totalCount: number }> {
  return request.post('/asset/inventory/task', params)
}

/** 盘点任务列表 */
export function getInventoryTaskList(params: { current: number; size: number }): Promise<{
  records: InventoryTaskItem[]
  total: number
  current: number
  size: number
}> {
  return request.get('/asset/inventory/task/list', { params })
}

/** 任务详情（含明细） */
export function getInventoryTaskDetail(id: number): Promise<{
  task: InventoryTaskItem
  items: InventoryItem[]
}> {
  return request.get(`/asset/inventory/task/${id}`)
}

/** 标记盘点明细 */
export function markInventoryItem(itemId: number, params: { result: number; remark?: string }): Promise<void> {
  return request.put(`/asset/inventory/item/${itemId}`, params)
}

/** 完成盘点 */
export function completeInventoryTask(id: number): Promise<void> {
  return request.put(`/asset/inventory/task/${id}/complete`)
}

/** 删除盘点任务 */
export function deleteInventoryTask(id: number): Promise<void> {
  return request.delete(`/asset/inventory/task/${id}`)
}
