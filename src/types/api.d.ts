/** 后端统一响应体 */
interface Result<T> {
  code: number
  msg: string
  data: T
}

/** Sa-Token StpUtil.getTokenInfo() 返回结构，字段与 Java 端 Jackson 序列化一致 */
interface TokenInfo {
  tokenName: string
  tokenValue: string
  isLogin: boolean
  loginId: string
}

/** 登录请求参数 */
interface LoginParams {
  username: string
  password: string
}

/** 角色信息 */
interface RoleInfo {
  roleId: number
  roleName: string
  roleKey: string
  createTime?: string
  menuIds?: number[]
}

/** 用户列表项（含角色） */
interface UserVO {
  userId: number
  userName: string
  nickName: string
  status: string
  createTime: string
  roles: RoleInfo[]
}

/** 新增用户参数 */
interface UserCreateParams {
  userName: string
  password: string
  nickName?: string
  status?: string
  roleIds?: number[]
}

/** 编辑用户参数 */
interface UserUpdateParams {
  userName?: string
  nickName?: string
  status?: string
  roleIds?: number[]
}

/** 角色参数 */
interface RoleParams {
  roleName: string
  roleKey: string
  menuIds?: number[]
}

/** 菜单项 */
interface MenuInfo {
  menuId: number
  menuName: string
  parentId: number
  menuType: string
  icon?: string
  path?: string
  component?: string
  perms?: string
  children?: MenuInfo[]
}

/** 菜单参数 */
interface MenuParams {
  menuName: string
  parentId?: number
  menuType: string
  icon?: string
  path?: string
  component?: string
  perms?: string
}

/* ========== 资产管理 ========== */

/** 资产列表项（含联表字段） */
interface AssetItem {
  assetId: number
  assetCode: string
  assetName: string
  categoryId: number | null
  categoryName: string
  model: string
  sn: string
  unitPrice: number
  purchaseDate: string
  department: string
  location: string
  status: number
  userId: number | null
  userName: string
  remark: string
  warrantyMonths?: number
  createTime: string
  updateTime: string
}

/** 操作日志 */
interface AssetLog {
  logId: number
  assetId: number
  operationType: number
  operatorId: number
  operatorName: string
  remark: string
  createTime: string
}

/** 分类项 */
interface AssetCategory {
  categoryId: number
  categoryName: string
  parentId: number
  createTime: string
}

/** 资产查询参数 */
interface AssetQueryParams {
  current: number
  size: number
  keyword?: string
  categoryId?: number
  status?: number
}

/** 新增/编辑资产表单 */
interface AssetFormParams {
  assetCode: string
  assetName: string
  categoryId?: number
  model?: string
  sn?: string
  unitPrice?: number
  purchaseDate?: string
  department?: string
  location?: string
  remark?: string
  warrantyMonths?: number
}

/* ========== Excel 导入导出 ========== */

interface ImportErrorItem {
  row: number
  reason: string
}

interface ImportResult {
  total: number
  success: number
  fail: number
  errors: ImportErrorItem[]
}

/* ========== 质保预警 ========== */

interface WarrantyQueryParams {
  current: number
  size: number
  days?: number
  keyword?: string
  categoryId?: number
  department?: string
}

interface WarrantyItem {
  assetId: number
  assetCode: string
  assetName: string
  categoryId: number
  categoryName: string
  model: string
  department: string
  location: string
  status: number
  unitPrice: number
  purchaseDate: string
  warrantyMonths: number
  warrantyExpiryDate: string
  createTime: string
}

/* ========== 盘点管理 ========== */

interface InventoryTaskParams {
  taskName: string
  department?: string
  categoryId?: number
}

interface InventoryTaskItem {
  taskId: number
  taskName: string
  department: string
  categoryId: number
  status: number
  totalCount: number
  normalCount: number
  abnormalCount: number
  uncheckedCount: number
  createTime: string
  finishTime: string
}

interface InventoryItem {
  itemId: number
  taskId: number
  assetId: number
  result: number
  remark: string
  checkTime: string
  assetCode: string
  assetName: string
  categoryName: string
  model: string
  department: string
  location: string
  assetStatus: number
}
