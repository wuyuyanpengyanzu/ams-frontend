import request from '@/utils/request'

/** 分页查询资产列表 */
export function getAssetList(params: AssetQueryParams): Promise<{
  records: AssetItem[]
  total: number
  current: number
  size: number
}> {
  return request.get('/asset/list', { params })
}

/** 资产详情（含操作日志） */
export function getAssetDetail(id: number): Promise<AssetItem & { logs: AssetLog[] }> {
  return request.get(`/asset/${id}`)
}

/** 新增资产 */
export function createAsset(params: AssetFormParams): Promise<void> {
  return request.post('/asset', params)
}

/** 编辑资产 */
export function updateAsset(id: number, params: AssetFormParams): Promise<void> {
  return request.put(`/asset/${id}`, params)
}

/** 删除资产（逻辑删除） */
export function deleteAsset(id: number): Promise<void> {
  return request.delete(`/asset/${id}`)
}

/** 领用资产 */
export function borrowAsset(id: number, params: { userId: number; remark?: string }): Promise<void> {
  return request.post(`/asset/${id}/borrow`, params)
}

/** 归还资产 */
export function returnAsset(id: number, params: { remark?: string }): Promise<void> {
  return request.post(`/asset/${id}/return`, params)
}

/** 报修资产 */
export function repairAsset(id: number, params: { remark?: string }): Promise<void> {
  return request.post(`/asset/${id}/repair`, params)
}

/** 报废资产 */
export function scrapAsset(id: number, params: { remark?: string }): Promise<void> {
  return request.post(`/asset/${id}/scrap`, params)
}
