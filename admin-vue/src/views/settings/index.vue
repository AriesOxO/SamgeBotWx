<template>
  <div class="settings-container">
    <el-card class="table-container">
      <div class="table-header">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><el-icon-plus /></el-icon>
            添加配置
          </el-button>
        </div>
      </div>

      <el-table :data="settingsList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="Key" label="配置键" width="200" />
        <el-table-column prop="Value" label="配置值">
          <template #default="scope">
            <div class="setting-value" @click="toggleValueExpand(scope.row)">
              <span :class="{ expanded: expandedKeys.includes(scope.row.Key) }">
                {{ scope.row.Value }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="Desc" label="描述" width="250" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加配置对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加配置" width="40%">
      <el-form ref="settingFormRef" :model="settingForm" :rules="settingRules" label-width="100px">
        <el-form-item label="配置键" prop="Key">
          <el-input v-model="settingForm.Key" placeholder="请输入配置键" />
        </el-form-item>
        <el-form-item label="配置值" prop="Value">
          <el-input
            v-model="settingForm.Value"
            type="textarea"
            :rows="4"
            placeholder="请输入配置值"
          />
        </el-form-item>
        <el-form-item label="描述" prop="Desc">
          <el-input v-model="settingForm.Desc" placeholder="请输入配置描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSettingForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑配置对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑配置" width="40%">
      <el-form
        ref="editSettingFormRef"
        :model="editSettingForm"
        :rules="editSettingRules"
        label-width="100px"
      >
        <el-form-item label="配置键">
          <el-input v-model="editSettingForm.Key" disabled />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input
            v-model="editSettingForm.value"
            type="textarea"
            :rows="4"
            placeholder="请输入配置值"
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="editSettingForm.desc" placeholder="请输入配置描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditSettingForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="删除确认" width="30%">
      <p>
        确定要删除配置 <strong>{{ settingToDelete }}</strong> 吗？此操作不可逆！
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAllSettings,
  getSettingByKey,
  addSetting,
  updateSetting,
  deleteSetting,
} from '@/api/setting'
import { Plus as ElIconPlus } from '@element-plus/icons-vue'

// 设置列表数据
const settingsList = ref([])
const loading = ref(false)
const expandedKeys = ref([])

// 对话框状态
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const settingToDelete = ref('')

// 添加设置表单
const settingFormRef = ref()
const settingForm = reactive({
  Key: '',
  Value: '',
  Desc: '',
})

// 编辑设置表单
const editSettingFormRef = ref()
const editSettingForm = reactive({
  Key: '',
  value: '',
  desc: '',
})

// 表单验证规则
const settingRules = {
  Key: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  Value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
}

const editSettingRules = {
  value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
}

// 页面加载时获取数据
onMounted(() => {
  fetchSettingsList()
})

// 获取设置列表
const fetchSettingsList = async () => {
  loading.value = true
  try {
    const response = await getAllSettings()
    settingsList.value = response.data || []
  } catch (error) {
    console.error('获取设置列表失败:', error)
    ElMessage.error('获取设置列表失败')
  } finally {
    loading.value = false
  }
}

// 切换配置值展开/收起状态
const toggleValueExpand = (row) => {
  const index = expandedKeys.value.indexOf(row.Key)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(row.Key)
  }
}

// 处理添加
const handleAdd = () => {
  resetSettingForm()
  addDialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  try {
    const response = await getSettingByKey(row.Key)
    const setting = response.data

    editSettingForm.Key = setting.Key
    editSettingForm.value = setting.Value
    editSettingForm.desc = setting.Desc || ''

    editDialogVisible.value = true
  } catch (error) {
    console.error('获取设置详情失败:', error)
    ElMessage.error('获取设置详情失败')
  }
}

// 处理删除
const handleDelete = (row) => {
  settingToDelete.value = row.Key
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!settingToDelete.value) return

  try {
    await deleteSetting(settingToDelete.value)
    ElMessage.success('删除成功')
    fetchSettingsList()
  } catch (error) {
    console.error('删除设置失败:', error)
    ElMessage.error('删除设置失败')
  } finally {
    deleteDialogVisible.value = false
  }
}

// 提交添加设置表单
const submitSettingForm = async () => {
  if (!settingFormRef.value) return

  await settingFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addSetting({
          Key: settingForm.Key,
          Value: settingForm.Value,
          Desc: settingForm.Desc,
        })
        ElMessage.success('添加成功')
        addDialogVisible.value = false
        fetchSettingsList()
      } catch (error) {
        console.error('添加设置失败:', error)
        ElMessage.error('添加设置失败')
      }
    }
  })
}

// 提交编辑设置表单
const submitEditSettingForm = async () => {
  if (!editSettingFormRef.value) return

  await editSettingFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateSetting(editSettingForm.Key, {
          value: editSettingForm.value,
          desc: editSettingForm.desc,
        })
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchSettingsList()
      } catch (error) {
        console.error('更新设置失败:', error)
        ElMessage.error('更新设置失败')
      }
    }
  })
}

// 重置设置表单
const resetSettingForm = () => {
  settingForm.Key = ''
  settingForm.Value = ''
  settingForm.Desc = ''
  if (settingFormRef.value) {
    settingFormRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 20px;

  .table-container {
    .table-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;

      .left {
        display: flex;
        align-items: center;
      }
    }

    .setting-value {
      cursor: pointer;

      span {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;

        &.expanded {
          white-space: normal;
          word-break: break-all;
        }
      }
    }
  }
}
</style>
