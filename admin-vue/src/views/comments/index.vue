<template>
  <div class="comments-container">
    <el-card class="filter-container">
      <div class="filter-header">
        <el-icon><el-icon-filter /></el-icon>
        <span>筛选条件</span>
      </div>
      <el-form :model="queryParams" inline>
        <el-form-item label="微信昵称">
          <el-input v-model="queryParams.wxNickName" placeholder="请输入微信昵称" clearable />
        </el-form-item>
        <el-form-item label="小说标题">
          <el-input v-model="queryParams.novelTitle" placeholder="请输入小说标题" clearable />
        </el-form-item>
        <el-form-item label="赛季">
          <el-input v-model="queryParams.number" placeholder="请输入赛季" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <div class="type-filter-group">
            <el-button
              :type="queryParams.type === undefined ? 'primary' : ''"
              :class="{ active: queryParams.type === undefined }"
              @click="handleTypeFilter(undefined)"
              size="default"
            >
              全部
            </el-button>
            <el-button
              :type="queryParams.type === 1 ? 'primary' : ''"
              :class="{ active: queryParams.type === 1 }"
              @click="handleTypeFilter(1)"
              size="default"
            >
              正文
            </el-button>
            <el-button
              :type="queryParams.type === 2 ? 'primary' : ''"
              :class="{ active: queryParams.type === 2 }"
              @click="handleTypeFilter(2)"
              size="default"
            >
              彩蛋
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><el-icon-search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><el-icon-refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 当前筛选条件显示 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-label">当前筛选:</span>
        <el-tag
          v-if="queryParams.wxNickName"
          closable
          @close="clearFilter('wxNickName')"
          class="filter-tag"
        >
          微信昵称: {{ queryParams.wxNickName }}
        </el-tag>
        <el-tag
          v-if="queryParams.novelTitle"
          closable
          @close="clearFilter('novelTitle')"
          class="filter-tag"
        >
          小说标题: {{ queryParams.novelTitle }}
        </el-tag>
        <el-tag
          v-if="queryParams.number"
          closable
          @close="clearFilter('number')"
          class="filter-tag"
        >
          赛季: {{ queryParams.number }}
        </el-tag>
        <el-tag v-if="queryParams.type" closable @close="clearFilter('type')" class="filter-tag">
          类型: {{ getTypeLabel(queryParams.type) }}
        </el-tag>
        <el-button link type="primary" @click="clearAllFilters" size="small"
          >清空所有筛选</el-button
        >
      </div>
    </el-card>

    <el-card class="table-container">
      <div class="table-header">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><el-icon-plus /></el-icon>
            添加评论
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedComments.size === 0"
            @click="handleBatchDelete"
          >
            <el-icon><el-icon-delete /></el-icon>
            批量删除
          </el-button>
          <span class="selected-count">已选择 {{ selectedComments.size }} 项</span>
        </div>
      </div>

      <el-table
        :data="commentList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="WxNickName" label="微信昵称" width="120" />
        <el-table-column prop="Number" label="赛季" width="80" />
        <el-table-column prop="NovelTitle" label="小说标题" width="180" />
        <el-table-column prop="NovelType" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.NovelType === 1 ? '' : 'success'">
              {{ scope.row.NovelType === 1 ? '正文' : '彩蛋' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="CommentText" label="评论内容" min-width="200">
          <template #default="scope">
            <div class="comment-content">
              <div class="comment-text-preview" @click="showCommentDetail(scope.row)">
                {{ truncateText(scope.row.CommentText, 80) }}
              </div>
              <el-button
                link
                type="primary"
                size="small"
                @click="showCommentDetail(scope.row)"
                class="view-detail-btn"
              >
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="评论详情"
      width="60%"
      class="comment-detail-dialog"
    >
      <div v-if="selectedComment" class="comment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="微信昵称">
            {{ selectedComment.WxNickName }}
          </el-descriptions-item>
          <el-descriptions-item label="赛季">
            {{ selectedComment.Number }}
          </el-descriptions-item>
          <el-descriptions-item label="小说标题">
            {{ selectedComment.NovelTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="selectedComment.NovelType === 1 ? '' : 'success'">
              {{ selectedComment.NovelType === 1 ? '正文' : '彩蛋' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ selectedComment.CreateTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="comment-content-detail">
          <h4>评论内容</h4>
          <div class="content-box">
            {{ selectedComment.CommentText }}
          </div>
          <div class="content-stats">
            <span>字符数: {{ selectedComment.CommentText?.length || 0 }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(selectedComment)">编辑</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加评论对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加评论' : '编辑评论'"
      width="50%"
    >
      <el-form ref="commentFormRef" :model="commentForm" :rules="commentRules" label-width="100px">
        <el-form-item label="微信昵称" prop="WxNickName">
          <el-input v-model="commentForm.WxNickName" placeholder="请输入微信昵称" />
        </el-form-item>
        <template v-if="dialogType === 'add'">
          <el-form-item label="小说标题" prop="NovelTitle">
            <el-input
              v-model="commentForm.NovelTitle"
              placeholder="请输入小说标题"
              @blur="handleNovelTitleBlur"
            />
            <div
              v-if="novelValidation.message"
              class="validation-message"
              :class="novelValidation.valid ? 'success' : 'error'"
            >
              {{ novelValidation.message }}
            </div>
          </el-form-item>
        </template>
        <el-form-item label="评论内容" prop="CommentText">
          <el-input
            v-model="commentForm.CommentText"
            type="textarea"
            :rows="5"
            placeholder="请输入评论内容"
            show-word-limit
            :maxlength="1000"
          />
          <div class="char-count">{{ commentForm.CommentText.length }}/50 字符（至少50字符）</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="删除确认" width="30%">
      <p>
        确定要删除{{
          batchDelete ? `选中的 ${selectedComments.size} 条` : '该'
        }}评论吗？此操作不可逆！
      </p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useCommentStore } from '@/stores/modules/comment'
import { NOVEL_TYPES } from '@/config'
import { truncateText } from '@/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Filter as ElIconFilter,
  Search as ElIconSearch,
  Refresh as ElIconRefresh,
  Delete as ElIconDelete,
  Plus as ElIconPlus,
} from '@element-plus/icons-vue'

const commentStore = useCommentStore()
const novelTypes = NOVEL_TYPES

// 表格数据
const commentList = computed(() => commentStore.commentList)
const total = computed(() => commentStore.total)
const loading = computed(() => commentStore.loading)
const currentPage = computed({
  get: () => commentStore.currentPage,
  set: (val) => commentStore.setPage(val),
})
const pageSize = computed({
  get: () => commentStore.pageSize,
  set: (val) => commentStore.setPageSize(val),
})
const queryParams = reactive(commentStore.queryParams)
const selectedComments = computed(() => commentStore.selectedComments)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const deleteDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const batchDelete = ref(false)
const commentToDelete = ref<number | null>(null)
const selectedComment = ref<any>(null)

// 评论表单
const commentFormRef = ref()
const commentForm = reactive({
  ID: 0,
  WxNickName: '',
  NovelTitle: '',
  CommentText: '',
})

// 小说标题验证状态
const novelValidation = reactive({
  valid: false,
  message: '',
  checking: false,
})

// 表单验证规则
const commentRules = {
  WxNickName: [{ required: true, message: '请输入微信昵称', trigger: 'blur' }],
  NovelTitle: [{ required: true, message: '请输入小说标题', trigger: 'blur' }],
  CommentText: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 50, message: '评论内容不能少于50个字符', trigger: 'blur' },
  ],
}

// 页面加载时获取数据
onMounted(() => {
  fetchCommentList()
})

// 获取评论列表
const fetchCommentList = () => {
  commentStore.fetchCommentList()
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  commentStore.selectedComments.clear()
  selection.forEach((item) => {
    commentStore.selectedComments.add(item.ID)
  })
}

// 处理搜索
const handleSearch = () => {
  commentStore.setPage(1)
  fetchCommentList()
}

// 处理重置
const handleReset = () => {
  commentStore.resetQueryParams()
  fetchCommentList()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  commentStore.setPageSize(val)
  fetchCommentList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  commentStore.setPage(val)
  fetchCommentList()
}

// 处理添加
const handleAdd = () => {
  resetForm()
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  resetForm()
  commentForm.ID = row.ID
  commentForm.WxNickName = row.WxNickName
  commentForm.CommentText = row.CommentText
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: any) => {
  batchDelete.value = false
  commentToDelete.value = row.ID
  deleteDialogVisible.value = true
}

// 处理批量删除
const handleBatchDelete = () => {
  if (commentStore.selectedComments.size === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  batchDelete.value = true
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (batchDelete.value) {
    await commentStore.batchRemoveComments()
    ElMessage.success('批量删除成功')
  } else if (commentToDelete.value) {
    await commentStore.removeComment(commentToDelete.value)
    ElMessage.success('删除成功')
  }
  deleteDialogVisible.value = false
}

// 处理小说标题模糊
const handleNovelTitleBlur = async () => {
  if (!commentForm.NovelTitle.trim()) {
    novelValidation.valid = false
    novelValidation.message = ''
    return
  }

  novelValidation.checking = true
  novelValidation.message = '正在检查小说标题...'

  try {
    const validation = await commentStore.validateNovelTitle(commentForm.NovelTitle)
    novelValidation.valid = validation.valid
    if (validation.valid) {
      novelValidation.message = `✓ 小说存在，类型：${
        validation.type === 1 ? '正文' : '彩蛋'
      }，赛季：${validation.number}`
    } else {
      novelValidation.message = validation.message || '小说标题无效'
    }
  } catch (error) {
    novelValidation.valid = false
    novelValidation.message = '检查小说标题时发生错误'
  } finally {
    novelValidation.checking = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!commentFormRef.value) return

  // 先验证小说标题
  if (dialogType.value === 'add' && !novelValidation.valid) {
    ElMessage.error('请确保小说标题有效')
    return
  }

  await commentFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await commentStore.createComment({
            WxNickName: commentForm.WxNickName,
            NovelTitle: commentForm.NovelTitle,
            CommentText: commentForm.CommentText,
          })
          ElMessage.success('添加成功')
        } else {
          await commentStore.editComment(commentForm.ID, {
            WxNickName: commentForm.WxNickName,
            CommentText: commentForm.CommentText,
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  commentForm.ID = 0
  commentForm.WxNickName = ''
  commentForm.NovelTitle = ''
  commentForm.CommentText = ''
  novelValidation.valid = false
  novelValidation.message = ''
  novelValidation.checking = false
  if (commentFormRef.value) {
    commentFormRef.value.resetFields()
  }
}

// 获取评论详情
const showCommentDetail = (row: any) => {
  selectedComment.value = row
  detailDialogVisible.value = true
}

// 获取类型标签
const getTypeLabel = (type: number | undefined) => {
  const item = novelTypes.find((item) => item.value === type)
  return item ? item.label : '全部'
}

// 清除过滤条件
const clearFilter = (filter: string) => {
  ;(queryParams as any)[filter] = undefined
  fetchCommentList()
}

// 清除所有过滤条件
const clearAllFilters = () => {
  queryParams.wxNickName = ''
  queryParams.novelTitle = ''
  queryParams.number = ''
  queryParams.type = undefined
  fetchCommentList()
}

// 获取是否有活动过滤条件
const hasActiveFilters = computed(() => {
  return queryParams.wxNickName || queryParams.novelTitle || queryParams.number || queryParams.type
})

// 处理类型筛选
const handleTypeFilter = (type: number | undefined) => {
  queryParams.type = type
  fetchCommentList()
}
</script>

<style lang="scss" scoped>
.comments-container {
  padding: 20px;

  .filter-container {
    margin-bottom: 20px;

    .filter-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 16px;

      .el-icon {
        margin-right: 8px;
      }
    }
  }

  .table-container {
    .table-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;

      .left {
        display: flex;
        align-items: center;

        .selected-count {
          margin-left: 15px;
          color: #606266;
        }
      }
    }

    .comment-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }

    .comment-content {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .comment-text-preview {
        line-height: 1.4;
        cursor: pointer;
        color: #606266;
        transition: color 0.3s;

        &:hover {
          color: #409eff;
        }
      }

      .view-detail-btn {
        align-self: flex-start;
        padding: 2px 8px;
        font-size: 12px;
        height: auto;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .char-count {
    text-align: right;
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .validation-message {
    font-size: 12px;
    margin-top: 5px;
    padding: 4px 8px;
    border-radius: 4px;

    &.success {
      color: #67c23a;
      background-color: #f0f9ff;
      border: 1px solid #d1ecf1;
    }

    &.error {
      color: #f56c6c;
      background-color: #fef0f0;
      border: 1px solid #fbc4c4;
    }
  }

  .active-filters {
    margin-top: 15px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .filter-label {
      margin-right: 8px;
      font-weight: 600;
      color: #303133;
      font-size: 14px;
    }

    .filter-tag {
      margin: 0;
      background-color: #409eff;
      color: #fff;
      border: 1px solid #409eff;

      &:hover {
        background-color: #337ecc;
        border-color: #337ecc;
      }
    }

    .el-button--link {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}

.comment-detail-dialog {
  .comment-detail {
    .comment-content-detail {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      h4 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }

      .content-box {
        background-color: #fff;
        padding: 15px;
        border-radius: 6px;
        line-height: 1.6;
        color: #606266;
        border: 1px solid #e4e7ed;
        margin-bottom: 10px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .content-stats {
        text-align: right;
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.type-filter-group {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;

  .el-button {
    margin: 0;
    border: none;
    border-radius: 0;
    border-right: 1px solid #dcdfe6;
    padding: 8px 20px;
    background-color: #fff;
    color: #606266;
    transition: all 0.3s ease;
    font-weight: 500;

    &:last-child {
      border-right: none;
    }

    &:hover {
      background-color: #f5f7fa;
      color: #409eff;
    }

    &.active,
    &--primary {
      background-color: #409eff;
      color: #fff;
      box-shadow: none;

      &:hover {
        background-color: #337ecc;
        color: #fff;
      }
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
}
</style>
