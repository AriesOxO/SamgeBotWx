<template>
  <div class="novels-container">
    <el-card class="filter-container">
      <div class="filter-header">
        <el-icon><el-icon-filter /></el-icon>
        <span>筛选条件</span>
      </div>
      <el-form :model="queryParams" inline>
        <el-form-item label="小说标题">
          <el-input v-model="queryParams.novelTitle" placeholder="请输入小说标题" clearable />
        </el-form-item>
        <el-form-item label="赛季">
          <el-input v-model="queryParams.number" placeholder="请输入赛季" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="queryParams.author" placeholder="请输入作者" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
            <el-option
              v-for="item in novelTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value === 0 ? undefined : item.value"
            />
          </el-select>
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
    </el-card>

    <el-card class="table-container">
      <div class="table-header">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><el-icon-plus /></el-icon>
            添加小说
          </el-button>
          <el-button type="primary" @click="handleBatchAdd">
            <el-icon><el-icon-document-add /></el-icon>
            批量添加
          </el-button>
          <el-button type="danger" :disabled="selectedNovels.size === 0" @click="handleBatchDelete">
            <el-icon><el-icon-delete /></el-icon>
            批量删除
          </el-button>
          <span class="selected-count">已选择 {{ selectedNovels.size }} 项</span>
        </div>
      </div>

      <el-table
        :data="novelList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="NovelTitle" label="小说标题" width="300" />
        <el-table-column prop="Number" label="赛季" width="80" />
        <el-table-column prop="Author" label="作者" width="120" />
        <el-table-column prop="Type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.Type === 1 ? '' : 'success'">
              {{ scope.row.Type === 1 ? '正文' : '彩蛋' }}
            </el-tag>
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

    <!-- 添加小说对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加小说" width="40%">
      <el-form ref="novelFormRef" :model="novelForm" :rules="novelRules" label-width="100px">
        <el-form-item label="小说标题" prop="NovelTitle">
          <el-input v-model="novelForm.NovelTitle" placeholder="请输入小说标题" />
        </el-form-item>
        <el-form-item label="赛季" prop="Number">
          <el-input-number v-model="novelForm.Number" :min="1" placeholder="请输入赛季" />
        </el-form-item>
        <el-form-item label="作者" prop="Author">
          <el-input v-model="novelForm.Author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="类型" prop="Type">
          <el-select v-model="novelForm.Type" placeholder="请选择类型">
            <el-option :label="'正文'" :value="1" />
            <el-option :label="'彩蛋'" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNovelForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加小说对话框 -->
    <el-dialog v-model="batchAddDialogVisible" title="批量添加小说" width="50%">
      <el-form label-width="100px">
        <el-form-item label="批量数据">
          <el-input
            v-model="batchNovelData"
            type="textarea"
            :rows="10"
            placeholder="请按照'小说标题,赛季,作者,类型'的格式输入，每行一条数据。类型：1-正文，2-彩蛋"
          />
        </el-form-item>
        <el-alert
          title="格式说明"
          type="info"
          description="每行一条数据，格式为'小说标题,赛季,作者,类型'，类型：1-正文，2-彩蛋，例如：我的小说,1,张三,1"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchNovel">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑小说对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑小说" width="40%">
      <el-form
        ref="editNovelFormRef"
        :model="editNovelForm"
        :rules="novelRules"
        label-width="100px"
      >
        <el-form-item label="小说标题" prop="NovelTitle">
          <el-input v-model="editNovelForm.NovelTitle" placeholder="请输入小说标题" />
        </el-form-item>
        <el-form-item label="赛季" prop="Number">
          <el-input-number v-model="editNovelForm.Number" :min="1" placeholder="请输入赛季" />
        </el-form-item>
        <el-form-item label="作者" prop="Author">
          <el-input v-model="editNovelForm.Author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="类型" prop="Type">
          <el-select v-model="editNovelForm.Type" placeholder="请选择类型">
            <el-option :label="'正文'" :value="1" />
            <el-option :label="'彩蛋'" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditNovelForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="删除确认" width="30%">
      <p>
        确定要删除{{
          batchDelete ? `选中的 ${selectedNovels.size} 本` : '该'
        }}小说吗？此操作不可逆！
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
import { ElMessage } from 'element-plus'
import {
  getNovels,
  addNovel,
  updateNovel,
  deleteNovel,
  batchAddNovels,
  getNovelById,
} from '@/api/novel'
import { NOVEL_TYPES } from '@/config'
import {
  Filter as ElIconFilter,
  Search as ElIconSearch,
  Refresh as ElIconRefresh,
  Delete as ElIconDelete,
  Plus as ElIconPlus,
  DocumentAdd as ElIconDocumentAdd,
} from '@element-plus/icons-vue'

// 小说列表数据
const novelList = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedNovels = ref(new Set())
const novelTypes = NOVEL_TYPES

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  novelTitle: '',
  number: '',
  author: '',
  type: undefined,
})

// 对话框状态
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const batchAddDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const batchDelete = ref(false)
const novelToDelete = ref(null)

// 表单数据
const novelFormRef = ref()
const novelForm = reactive({
  NovelTitle: '',
  Number: 1,
  Author: '',
  Type: 1,
})

const editNovelFormRef = ref()
const editNovelForm = reactive({
  ID: 0,
  NovelTitle: '',
  Number: 1,
  Author: '',
  Type: 1,
})

const batchNovelData = ref('')

// 表单验证规则
const novelRules = {
  NovelTitle: [{ required: true, message: '请输入小说标题', trigger: 'blur' }],
  Number: [{ required: true, message: '请输入赛季', trigger: 'blur' }],
  Author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  Type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// 页面加载时获取数据
onMounted(() => {
  fetchNovelList()
})

// 获取小说列表
const fetchNovelList = async () => {
  loading.value = true
  try {
    const response = await getNovels(queryParams)
    novelList.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('获取小说列表失败:', error)
    ElMessage.error('获取小说列表失败')
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedNovels.value.clear()
  selection.forEach((item) => {
    selectedNovels.value.add(item.ID)
  })
}

// 处理搜索
const handleSearch = () => {
  queryParams.page = 1
  currentPage.value = 1
  fetchNovelList()
}

// 处理重置
const handleReset = () => {
  queryParams.novelTitle = ''
  queryParams.number = ''
  queryParams.author = ''
  queryParams.type = undefined
  queryParams.page = 1
  currentPage.value = 1
  fetchNovelList()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  queryParams.pageSize = val
  fetchNovelList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  queryParams.page = val
  fetchNovelList()
}

// 处理添加
const handleAdd = () => {
  resetNovelForm()
  addDialogVisible.value = true
}

// 处理批量添加
const handleBatchAdd = () => {
  batchNovelData.value = ''
  batchAddDialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  try {
    const response = await getNovelById(row.ID)
    const novel = response.data

    editNovelForm.ID = novel.ID
    editNovelForm.NovelTitle = novel.NovelTitle
    editNovelForm.Number = novel.Number
    editNovelForm.Author = novel.Author
    editNovelForm.Type = novel.Type

    editDialogVisible.value = true
  } catch (error) {
    console.error('获取小说详情失败:', error)
    ElMessage.error('获取小说详情失败')
  }
}

// 处理删除
const handleDelete = (row) => {
  batchDelete.value = false
  novelToDelete.value = row.ID
  deleteDialogVisible.value = true
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedNovels.value.size === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  batchDelete.value = true
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    if (batchDelete.value) {
      const ids = Array.from(selectedNovels.value)
      for (const id of ids) {
        await deleteNovel(id)
      }
      ElMessage.success('批量删除成功')
    } else if (novelToDelete.value) {
      await deleteNovel(novelToDelete.value)
      ElMessage.success('删除成功')
    }
    fetchNovelList()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    deleteDialogVisible.value = false
  }
}

// 提交小说表单
const submitNovelForm = async () => {
  if (!novelFormRef.value) return

  await novelFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addNovel(novelForm)
        ElMessage.success('添加成功')
        addDialogVisible.value = false
        fetchNovelList()
      } catch (error) {
        console.error('添加小说失败:', error)
        ElMessage.error('添加小说失败')
      }
    }
  })
}

// 提交编辑小说表单
const submitEditNovelForm = async () => {
  if (!editNovelFormRef.value) return

  await editNovelFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateNovel(editNovelForm.ID, {
          NovelTitle: editNovelForm.NovelTitle,
          Number: editNovelForm.Number,
          Author: editNovelForm.Author,
          Type: editNovelForm.Type,
        })
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchNovelList()
      } catch (error) {
        console.error('更新小说失败:', error)
        ElMessage.error('更新小说失败')
      }
    }
  })
}

// 提交批量添加小说
const submitBatchNovel = async () => {
  if (!batchNovelData.value.trim()) {
    ElMessage.warning('请输入批量数据')
    return
  }

  try {
    const lines = batchNovelData.value.split('\n')
    const novels = []

    for (const line of lines) {
      if (!line.trim()) continue

      const parts = line.split(',')
      if (parts.length < 3) {
        ElMessage.warning(`格式错误: ${line}，请按照'小说标题,赛季,作者,类型'的格式输入`)
        continue
      }

      const title = parts[0].trim()
      const numberStr = parts[1].trim()
      const author = parts[2].trim()
      const typeStr = parts[3]?.trim() || '1'

      if (title === '' || numberStr === '' || author === '') {
        ElMessage.warning(`数据错误: ${line}，请确保所有字段不为空`)
        continue
      }

      const number = parseInt(numberStr)
      const type = parseInt(typeStr)

      if (isNaN(number)) {
        ElMessage.warning(`数据错误: ${line}，赛季必须是有效的数字`)
        continue
      }

      if (isNaN(type) || (type !== 1 && type !== 2)) {
        ElMessage.warning(`数据错误: ${line}，类型必须是1或2`)
        continue
      }

      novels.push({
        NovelTitle: title,
        Number: number,
        Author: author,
        Type: type,
      })
    }

    if (novels.length === 0) {
      ElMessage.warning('没有有效的小说数据')
      return
    }

    await batchAddNovels(novels)
    ElMessage.success('批量添加成功')
    batchAddDialogVisible.value = false
    fetchNovelList()
  } catch (error) {
    console.error('批量添加小说失败:', error)
    ElMessage.error('批量添加小说失败')
  }
}

// 重置小说表单
const resetNovelForm = () => {
  novelForm.NovelTitle = ''
  novelForm.Number = 1
  novelForm.Author = ''
  novelForm.Type = 1
  if (novelFormRef.value) {
    novelFormRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.novels-container {
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

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
