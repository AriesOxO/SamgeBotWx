<template>
  <div class="app-container">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="aside-container">
        <div class="logo-container">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <h1 class="logo-text" v-if="!isCollapse">{{ appTitle }}</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-menu-item index="/comments">
            <el-icon><ChatLineSquare /></el-icon>
            <template #title>评论管理</template>
          </el-menu-item>

          <el-menu-item index="/novels">
            <el-icon><Files /></el-icon>
            <template #title>小说管理</template>
          </el-menu-item>

          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部栏 -->
        <el-header class="header-container">
          <div class="left">
            <!-- 折叠按钮 -->
            <el-button type="text" @click="toggleCollapse" class="collapse-btn">
              <el-icon v-if="isCollapse"><Expand /></el-icon>
              <el-icon v-else><Fold /></el-icon>
            </el-button>
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/">
              <el-breadcrumb-item
                v-for="item in breadcrumbs"
                :key="item.path"
                :to="{ path: item.path }"
              >
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right">
            <el-dropdown trigger="click">
              <span class="user-info">
                管理员 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="toggleDarkMode">
                    {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
                  </el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main class="main-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// Element Plus 图标
import {
  Monitor,
  ChatLineSquare,
  Files,
  Setting,
  Fold,
  Expand,
  ArrowDown,
} from '@element-plus/icons-vue'

const appTitle = '小说评论管理系统'
const route = useRoute()
const isCollapse = ref(false)
const isDark = ref(false)

// 活动菜单
const activeMenu = computed(() => {
  return route.path
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const { path, meta } = route
  const pathArray = path.split('/').filter(Boolean)
  const breadcrumbs = [{ path: '/', name: '首页' }]

  let currentPath = ''
  pathArray.forEach((item) => {
    currentPath += `/${item}`
    breadcrumbs.push({
      path: currentPath,
      name: (meta?.title as string) || item,
    })
  })

  return breadcrumbs
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 切换暗色/亮色模式
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  // 切换暗色模式逻辑在这里实现
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.app-container {
  height: 100vh;
  width: 100vw;
}

.layout-container {
  height: 100%;
}

.aside-container {
  background-color: #304156;
  height: 100%;
  transition: width $transition-duration $transition-timing-function;
  overflow: hidden;

  .logo-container {
    height: $header-height;
    padding: 10px;
    display: flex;
    align-items: center;

    .logo-icon {
      width: 32px;
      height: 32px;
      margin-right: $spacing-sm;
    }

    .logo-text {
      font-size: 18px;
      color: #fff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .el-menu-vertical:not(.el-menu--collapse) {
    width: $sidebar-width;
  }

  .el-menu-vertical {
    border-right: none;
  }
}

.header-container {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;

  .left {
    display: flex;
    align-items: center;

    .collapse-btn {
      font-size: 20px;
      color: #666;
      margin-right: $spacing-md;
      padding: 0;
    }
  }

  .right {
    display: flex;
    align-items: center;

    .user-info {
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
    }
  }
}

.main-container {
  background-color: #f5f7fa;
  padding: $spacing-md;
  overflow-y: auto;
}
</style>
