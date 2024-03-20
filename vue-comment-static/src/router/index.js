import { createRouter, createWebHistory } from 'vue-router';
import CommentsPage from '@/views/CommentsPage.vue';

const routes = [
    {
        path: '/comments',
        name: 'Comments',
        component: CommentsPage
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
