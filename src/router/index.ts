import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/components/Layout.vue'),
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/Dashboard.vue') },
        { path: 'projects', name: 'projects', component: () => import('@/views/Projects.vue') },
        { path: 'projects/:id', name: 'project-detail', component: () => import('@/views/ProjectDetail.vue') },
        { path: 'active', name: 'active', component: () => import('@/views/ActiveWork.vue') },
        { path: 'statistics', name: 'statistics', component: () => import('@/views/Statistics.vue') },
        { path: 'calendar', name: 'calendar', component: () => import('@/views/CalendarView.vue') },
      ],
    },
  ],
})

export default router
