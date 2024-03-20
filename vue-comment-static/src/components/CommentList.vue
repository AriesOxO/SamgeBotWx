<template>
  <div>
    <h1>Comments</h1>
    <ul>
      <li v-for="comment in comments" :key="comment.id">
        <p>{{ comment.wxNickName }}</p>
        <p>{{ comment.commentText }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    comments: {
      type: Array,
      required: true
    }
  }
}
</script>
