<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <StatCard
          title="评论总数"
          :value="totalComments"
          icon="ChatDotRound"
          type="primary"
          subtitle="全站评论"
          :trend="{ type: 'up', value: 12 }"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="小说总数"
          :value="totalNovels"
          icon="Reading"
          type="success"
          subtitle="收录小说"
          :trend="{ type: 'up', value: 8 }"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="正文小说"
          :value="mainNovels"
          icon="Document"
          type="warning"
          subtitle="正文类型"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="彩蛋小说"
          :value="bonusNovels"
          icon="Trophy"
          type="info"
          subtitle="彩蛋类型"
        />
      </el-col>
    </el-row>

    <!-- 当前赛季信息 -->
    <el-row :gutter="20" class="season-row">
      <el-col :span="24">
        <el-card class="season-card">
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>当前赛季信息</span>
            </div>
          </template>
          <div class="season-info">
            <div class="season-number">
              <span class="label">赛季：</span>
              <span class="value">第 {{ currentSeason }} 季</span>
            </div>
            <div class="season-stats">
              <div class="stat-item">
                <span class="number">{{ seasonComments }}</span>
                <span class="label">本季评论</span>
              </div>
              <div class="stat-item">
                <span class="number">{{ seasonNovels }}</span>
                <span class="label">本季小说</span>
              </div>
              <div class="stat-item">
                <span class="number">{{ todayComments }}</span>
                <span class="label">今日评论</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和表格区域 -->
    <el-row :gutter="20" class="content-row">
      <!-- 评论类型分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>评论类型分布</span>
            </div>
          </template>
          <CommentChart type="pie" :data="commentTypeData" :loading="chartLoading" />
        </el-card>
      </el-col>

      <!-- 小说评论排行 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>小说评论排行</span>
              <div class="header-actions">
                <el-radio-group v-model="rankingTypeFilter" size="small" @change="loadChartData">
                  <el-radio-button :value="0">全部</el-radio-button>
                  <el-radio-button :value="1">正文</el-radio-button>
                  <el-radio-button :value="2">彩蛋</el-radio-button>
                </el-radio-group>
                <el-button size="small" @click="showAllRanking = true"> 查看全部 </el-button>
              </div>
            </div>
          </template>
          <CommentChart type="bar" :data="novelRankingData" :loading="chartLoading" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近评论 -->
    <el-row :gutter="20" class="table-row">
      <el-col :span="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>最近评论</span>
              <div class="header-actions">
                <el-button size="small" @click="refreshData">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button size="small" type="primary" @click="$router.push('/comments')">
                  查看全部
                </el-button>
              </div>
            </div>
          </template>
          <el-table
            :data="recentComments"
            style="width: 100%"
            v-loading="tableLoading"
            empty-text="暂无评论数据"
          >
            <el-table-column prop="WxNickName" label="微信昵称" width="120" />
            <el-table-column prop="NovelTitle" label="小说标题" width="220" />
            <el-table-column prop="Type" label="类型" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.Type === 1 ? '' : 'success'" size="small">
                  {{ scope.row.Type === 1 ? '正文' : '彩蛋' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="CommentText" label="评论内容" min-width="300">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.CommentText"
                  placement="top-start"
                  :disabled="scope.row.CommentText.length <= 50"
                >
                  <div class="comment-text">
                    {{ truncateText(scope.row.CommentText, 50) }}
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="CreateTime" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.CreateTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 查看全部排行对话框 -->
    <el-dialog v-model="showAllRanking" title="小说评论排行榜" width="60%">
      <div class="ranking-filter">
        <el-radio-group v-model="allRankingTypeFilter" @change="loadAllRankingData">
          <el-radio-button :value="0">全部</el-radio-button>
          <el-radio-button :value="1">正文</el-radio-button>
          <el-radio-button :value="2">彩蛋</el-radio-button>
        </el-radio-group>
      </div>
      <el-table
        :data="allRankingData"
        style="width: 100%"
        v-loading="allRankingLoading"
        max-height="400"
      >
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="NovelTitle" label="小说标题" />
        <el-table-column prop="Type" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.Type === 1 ? '' : 'success'">
              {{ scope.row.Type === 1 ? '正文' : '彩蛋' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Count" label="评论数" width="100" />
      </el-table>
      <template #footer>
        <el-button @click="showAllRanking = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getComments } from '@/api/comment'
import { getNovels } from '@/api/novel'
import { getStatistics, getSettingByKey } from '@/api/setting'
import { formatDate, truncateText } from '@/utils'
import StatCard from '@/components/dashboard/StatCard.vue'
import CommentChart from '@/components/charts/CommentChart.vue'
import { DataLine, Reading, Trophy, ChatDotRound, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

// 基础统计数据
const totalComments = ref(0)
const totalNovels = ref(0)
const mainNovels = ref(0)
const bonusNovels = ref(0)
const currentSeason = ref('未设置')
const seasonComments = ref(0)
const seasonNovels = ref(0)
const todayComments = ref(0)

// 图表数据
const commentTypeData = ref([])
const novelRankingData = ref([])

// 表格数据
const recentComments = ref([])

// 加载状态
const chartLoading = ref(false)
const tableLoading = ref(false)

// 小说评论排行类型筛选
const rankingTypeFilter = ref(0)

// 查看全部排行相关
const showAllRanking = ref(false)
const allRankingTypeFilter = ref(0)
const allRankingData = ref([])
const allRankingLoading = ref(false)

// 加载基础统计数据
const loadBasicStats = async () => {
  try {
    // 获取评论总数
    const commentsResponse = await getComments({ page: 1, pageSize: 1 })
    totalComments.value = commentsResponse.total || 0

    // 获取小说总数和类型分布
    const novelsResponse = await getNovels({ page: 1, pageSize: 1000 })
    const novels = novelsResponse.data || []
    totalNovels.value = novels.length
    mainNovels.value = novels.filter((n) => n.Type === 1).length
    bonusNovels.value = novels.filter((n) => n.Type === 2).length

    // 获取当前赛季
    const seasonResponse = await getSettingByKey('competition_number')
    if (seasonResponse.data) {
      currentSeason.value = seasonResponse.data.Value

      // 获取当前赛季数据
      await loadSeasonStats(currentSeason.value)
    }
  } catch (error) {
    console.error('加载基础统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载赛季统计数据
const loadSeasonStats = async (season: string) => {
  try {
    // 获取当前赛季评论数
    const seasonCommentsResponse = await getComments({
      page: 1,
      pageSize: 1,
      number: season,
    })
    seasonComments.value = seasonCommentsResponse.total || 0

    // 获取当前赛季小说数
    const seasonNovelsResponse = await getNovels({
      page: 1,
      pageSize: 1,
      number: season,
    })
    seasonNovels.value = seasonNovelsResponse.total || 0

    // 获取今日评论数
    const today = new Date().toISOString().split('T')[0]
    const todayCommentsResponse = await getComments({
      page: 1,
      pageSize: 1,
      startTime: today + ' 00:00:00',
      endTime: today + ' 23:59:59',
    })
    todayComments.value = todayCommentsResponse.total || 0
  } catch (error) {
    console.error('加载赛季统计数据失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  chartLoading.value = true
  try {
    // 评论类型分布
    const typeStats = await Promise.all([
      getComments({ page: 1, pageSize: 1, type: 1 }),
      getComments({ page: 1, pageSize: 1, type: 2 }),
    ])

    commentTypeData.value = [
      { name: '正文评论', value: typeStats[0].total || 0 },
      { name: '彩蛋评论', value: typeStats[1].total || 0 },
    ]

    // 小说评论排行（取评论最多的前10本小说，支持类型筛选）
    const statisticsResponse = await getStatistics(2, rankingTypeFilter.value)
    novelRankingData.value = (statisticsResponse || []).slice(0, 10).map((item) => ({
      name: item.NovelTitle?.replace(/《|》/g, '') || '未知',
      value: item.Count || 0,
    }))
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 加载最近评论
const loadRecentComments = async () => {
  tableLoading.value = true
  try {
    const response = await getComments({ page: 1, pageSize: 10 })
    recentComments.value = response.data || []
  } catch (error) {
    console.error('加载最近评论失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([loadBasicStats(), loadChartData(), loadRecentComments()])
  ElMessage.success('数据刷新成功')
}

// 加载全部排行数据
const loadAllRankingData = async () => {
  allRankingLoading.value = true
  try {
    const response = await getStatistics(2, allRankingTypeFilter.value)
    allRankingData.value = response || []
  } catch (error) {
    console.error('加载全部排行数据失败:', error)
  } finally {
    allRankingLoading.value = false
  }
}

// 页面加载时初始化数据
onMounted(async () => {
  await Promise.all([loadBasicStats(), loadChartData(), loadRecentComments()])
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.stats-row {
  margin-bottom: 20px;
}

.season-row {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.table-row {
  margin-bottom: 20px;
}

.season-card {
  .season-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .season-number {
      .label {
        color: #909399;
        margin-right: 10px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
      }
    }

    .season-stats {
      display: flex;
      gap: 40px;

      .stat-item {
        text-align: center;

        .number {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .label {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

.chart-card,
.table-card {
  height: 400px;

  :deep(.el-card__body) {
    height: calc(100% - 57px);
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div:first-child {
    display: flex;
    align-items: center;
  }

  .el-icon {
    margin-right: 8px;
    color: #409eff;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.comment-text {
  line-height: 1.5;
  word-break: break-all;
}

:deep(.el-table) {
  .el-table__body-wrapper {
    max-height: 300px;
  }
}

.ranking-filter {
  margin-bottom: 20px;
  text-align: center;
}
</style>
