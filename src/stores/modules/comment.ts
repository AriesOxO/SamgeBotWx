import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { 
  getComments,
  addComment,
  updateComment,
  deleteComment,
  batchDeleteComments,
  checkNovelTitle,
  type Comment,
  type CommentFormData,
  type CommentEditData
} from '@/api/comment'

export const useCommentStore = defineStore('comment', () => {
  // 状态
  const commentList = ref<Comment[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedComments = ref(new Set<number>())

  // 查询参数
  const queryParams = reactive({
    page: 1,
    pageSize: 10,
    wxNickName: '',
    novelTitle: '',
    number: '',
    type: undefined as number | undefined
  })

  // 设置页码
  const setPage = (page: number) => {
    currentPage.value = page
    queryParams.page = page
  }

  // 设置页大小
  const setPageSize = (size: number) => {
    pageSize.value = size
    queryParams.pageSize = size
  }

  // 重置查询参数
  const resetQueryParams = () => {
    queryParams.page = 1
    queryParams.pageSize = 10
    queryParams.wxNickName = ''
    queryParams.novelTitle = ''
    queryParams.number = ''
    queryParams.type = undefined
    currentPage.value = 1
  }

  // 获取评论列表
  const fetchCommentList = async () => {
    loading.value = true
    try {
      const response = await getComments(queryParams)
      commentList.value = response.data
      total.value = response.total
    } catch (error) {
      console.error('获取评论列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 检查小说标题
  const validateNovelTitle = async (novelTitle: string): Promise<{
    valid: boolean;
    message?: string;
    type?: number;
    number?: number;
  }> => {
    try {
      const response = await checkNovelTitle(novelTitle)
      if (response.exists) {
        return {
          valid: true,
          type: response.type,
          number: response.number
        }
      } else {
        return {
          valid: false,
          message: '小说标题不在当前赛季目录中'
        }
      }
    } catch (error) {
      console.error('检查小说标题失败:', error)
      return {
        valid: false,
        message: '检查小说标题时发生错误'
      }
    }
  }

  // 创建评论
  const createComment = async (commentData: CommentFormData) => {
    loading.value = true
    try {
      // 先检查小说标题是否有效
      const validation = await validateNovelTitle(commentData.NovelTitle)
      if (!validation.valid) {
        throw new Error(validation.message || '小说标题无效')
      }

      await addComment(commentData)
      await fetchCommentList()
    } catch (error) {
      console.error('创建评论失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 编辑评论
  const editComment = async (id: number, commentData: CommentEditData) => {
    loading.value = true
    try {
      await updateComment(id, commentData)
      await fetchCommentList()
    } catch (error) {
      console.error('编辑评论失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除评论
  const removeComment = async (id: number) => {
    loading.value = true
    try {
      await deleteComment(id)
      await fetchCommentList()
    } catch (error) {
      console.error('删除评论失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 批量删除评论
  const batchRemoveComments = async () => {
    loading.value = true
    try {
      const ids = Array.from(selectedComments.value)
      await batchDeleteComments(ids)
      selectedComments.value.clear()
      await fetchCommentList()
    } catch (error) {
      console.error('批量删除评论失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    commentList,
    total,
    loading,
    currentPage,
    pageSize,
    selectedComments,
    queryParams,
    
    // 方法
    setPage,
    setPageSize,
    resetQueryParams,
    fetchCommentList,
    validateNovelTitle,
    createComment,
    editComment,
    removeComment,
    batchRemoveComments
  }
}) 