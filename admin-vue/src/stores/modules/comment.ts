import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { getComments, addComment, updateComment, deleteComment } from '@/api/comment';
import type { CommentData, CommentQuery } from '@/api/comment';

export const useCommentStore = defineStore('comment', () => {
  const commentList = ref<CommentData[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 查询条件
  const queryParams = reactive<CommentQuery>({
    page: 1,
    pageSize: 10,
    wxNickName: '',
    novelTitle: '',
    number: '',
    startTime: '',
    endTime: '',
    type: undefined
  });

  // 已选择的评论ID集合
  const selectedComments = ref<Set<number>>(new Set());

  // 获取评论列表
  const fetchCommentList = async () => {
    loading.value = true;
    try {
      const response = await getComments({
        ...queryParams,
        page: queryParams.page
      });

      commentList.value = response.data;
      total.value = response.total;
    } catch (error) {
      console.error('获取评论列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 添加评论
  const createComment = async (commentData: any) => {
    try {
      await addComment(commentData);
      // 重新加载列表
      await fetchCommentList();
      return true;
    } catch (error) {
      console.error('添加评论失败:', error);
      return false;
    }
  };

  // 更新评论
  const editComment = async (id: number, commentData: any) => {
    try {
      await updateComment(id, commentData);
      // 重新加载列表
      await fetchCommentList();
      return true;
    } catch (error) {
      console.error('更新评论失败:', error);
      return false;
    }
  };

  // 删除评论
  const removeComment = async (id: number) => {
    try {
      await deleteComment(id);
      // 重新加载列表
      await fetchCommentList();
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      return false;
    }
  };

  // 批量删除评论
  const batchRemoveComments = async () => {
    if (selectedComments.value.size === 0) return false;

    try {
      const ids = Array.from(selectedComments.value);
      for (const id of ids) {
        await deleteComment(id);
      }
      // 清空选中状态
      selectedComments.value.clear();
      // 重新加载列表
      await fetchCommentList();
      return true;
    } catch (error) {
      console.error('批量删除评论失败:', error);
      return false;
    }
  };

  // 设置查询参数
  const setQueryParams = (params: Partial<CommentQuery>) => {
    Object.assign(queryParams, params);
  };

  // 重置查询参数
  const resetQueryParams = () => {
    Object.assign(queryParams, {
      page: 1,
      pageSize: 10,
      wxNickName: '',
      novelTitle: '',
      number: '',
      startTime: '',
      endTime: '',
      type: undefined
    });
  };

  // 设置页码
  const setPage = (page: number) => {
    queryParams.page = page;
    currentPage.value = page;
  };

  // 设置每页条数
  const setPageSize = (size: number) => {
    queryParams.pageSize = size;
    pageSize.value = size;
  };

  return {
    commentList,
    total,
    loading,
    currentPage,
    pageSize,
    queryParams,
    selectedComments,
    fetchCommentList,
    createComment,
    editComment,
    removeComment,
    batchRemoveComments,
    setQueryParams,
    resetQueryParams,
    setPage,
    setPageSize
  };
});
