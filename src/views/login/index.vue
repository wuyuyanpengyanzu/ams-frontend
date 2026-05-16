<template>
  <div class="login-page">
    <!-- 左侧品牌区 -->
    <div class="login-brand">
      <div class="brand-content">
        <div class="brand-logo">A</div>
        <h1 class="brand-title">AMS</h1>
        <p class="brand-subtitle">ASSET MANAGEMENT SYSTEM</p>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-form-area">
      <h2>欢迎回来</h2>
      <p class="login-hint">登录您的资产管理账户</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="btn-login" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { login, fetchPermissions } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { addDynamicRoutes } from '@/router'

const router = useRouter()
const userStore = useUserStore()
const menuStore = useMenuStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<LoginParams>({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const tokenInfo = await login(form)
    userStore.setToken(tokenInfo.tokenValue)
    const perms = await fetchPermissions()
    userStore.setPermissions(perms)
    const menus = await menuStore.fetchMenu()
    addDynamicRoutes(menus)
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    // 错误已在拦截器中统一提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.login-page {
  display: flex;
  height: 100vh;
  width: 100vw;
}

/* ======== 左侧品牌区 ======== */
.login-brand {
  flex: 1;
  background: linear-gradient(135deg, $deep-blue 0%, $deeper-blue 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    border: 1px solid rgba($gold, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    border: 1px solid rgba($gold, 0.08);
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.brand-logo {
  width: 72px;
  height: 72px;
  border: 2px solid $gold;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 32px;
  font-weight: 700;
  color: $gold;
  background: rgba($gold, 0.08);
}

.brand-title {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 2px;
}

/* ======== 右侧表单区 ======== */
.login-form-area {
  width: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 64px;
  background: $bg-light;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: $text-primary;
  }
}

.login-hint {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 32px;
}

/* Element Plus 输入框覆盖 */
:deep(.el-input__wrapper) {
  border-radius: $radius-sm;
  box-shadow: 0 0 0 1px $border-color;
}

:deep(.el-input__wrapper:focus),
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px $deep-blue;
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: $text-primary;
}

:deep(.el-input__inner::placeholder) {
  color: $text-light;
}

/* 登录按钮 */
.btn-login {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: $radius-sm;
  background: $deep-blue;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;

  &:hover {
    background: $deeper-blue;
    box-shadow: $shadow-md;
  }
}
</style>
