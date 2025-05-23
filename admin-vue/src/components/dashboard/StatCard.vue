<template>
  <el-card class="stat-card" :class="type">
    <div class="card-content">
      <div class="stat-icon">
        <el-icon :size="32">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">{{ formattedValue }}</div>
        <div class="stat-subtitle" v-if="subtitle">{{ subtitle }}</div>
      </div>
      <div class="stat-trend" v-if="trend">
        <el-icon :class="trend.type">
          <component :is="trendIcon" />
        </el-icon>
        <span>{{ trend.value }}%</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowUp,
  ArrowDown,
  DataLine,
  Reading,
  Trophy,
  ChatDotRound,
  User,
  Document,
} from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  trend?: {
    type: 'up' | 'down'
    value: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  icon: 'DataLine',
})

const iconComponent = computed(() => {
  const iconMap = {
    DataLine,
    Reading,
    Trophy,
    ChatDotRound,
    User,
    Document,
  }
  return iconMap[props.icon as keyof typeof iconMap] || DataLine
})

const trendIcon = computed(() => {
  return props.trend?.type === 'up' ? ArrowUp : ArrowDown
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style lang="scss" scoped>
.stat-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  }

  &.primary {
    border-left: 4px solid #409eff;

    .stat-icon {
      color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }
  }

  &.success {
    border-left: 4px solid #67c23a;

    .stat-icon {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);
    }
  }

  &.warning {
    border-left: 4px solid #e6a23c;

    .stat-icon {
      color: #e6a23c;
      background: rgba(230, 162, 60, 0.1);
    }
  }

  &.danger {
    border-left: 4px solid #f56c6c;

    .stat-icon {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);
    }
  }

  &.info {
    border-left: 4px solid #909399;

    .stat-icon {
      color: #909399;
      background: rgba(144, 147, 153, 0.1);
    }
  }
}

.card-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-subtitle {
  font-size: 12px;
  color: #c0c4cc;
}

.stat-trend {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;

  .el-icon {
    margin-bottom: 2px;

    &.up {
      color: #67c23a;
    }

    &.down {
      color: #f56c6c;
    }
  }

  span {
    color: #909399;
  }
}
</style>
