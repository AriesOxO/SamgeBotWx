<template>
  <div>
    <h1>Comments Page</h1>
    <CommentList :comments="comments" />
  </div>
</template>

<script>
import CommentList from '@/components/CommentList.vue';

export default {
  components: {
    CommentList
  },
  data() {
    return {
      comments: [] // 这里存放从后端获取的评论数据
    };
  },
  methods: {
    fetchComments() {
      // 发送请求获取评论数据
      // 你可以使用 axios 或者其他库来发送请求
    }
  },
  mounted() {
    this.fetchComments();
  }
};
</script>
