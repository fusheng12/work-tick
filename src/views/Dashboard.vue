<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">今日工作概览</p>
    </div>

    <div class="stats-cards">
      <div class="stat-card stat-card--hero">
        <div class="stat-icon-wrap stat-icon--time">
          <span class="stat-icon">⏱</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatDuration(todaySummary.total_seconds) }}</div>
          <div class="stat-label">今日工时</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon--done">
          <span class="stat-icon">✅</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ todaySummary.completedTasks || 0 }}</div>
          <div class="stat-label">完成任务</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon--sessions">
          <span class="stat-icon">🔄</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ todaySummary.activeProjects }}</div>
          <div class="stat-label">活跃项目</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon--projects">
          <span class="stat-icon">📁</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ projects.length }}</div>
          <div class="stat-label">总项目数</div>
        </div>
      </div>
    </div>

    <div class="task-panels">
      <div class="task-panel">
        <div class="section-header">
          <h2 class="section-title">待办任务</h2>
          <span class="task-count" v-if="todoTasks.length">{{ todoTasks.length }} 项</span>
        </div>
        <div v-if="todoTasks.length === 0" class="empty-hint empty-hint--compact">
          <div class="empty-icon">📋</div>
          <p>暂无待办任务</p>
        </div>
        <div class="quick-task-list">
          <div v-for="t in todoTasks.slice(0, 6)" :key="t.id" class="quick-task-item" @click="startWork(t)">
            <span class="priority-dot" :class="t.priority"></span>
            <div class="task-info">
              <span class="task-name">{{ t.title }}</span>
            </div>
            <span class="task-tag" :style="{ background: getProjectTagBg(t.project_id), color: getProjectColor(t.project_id) }">
              {{ getProjectName(t.project_id) }}
            </span>
            <button class="btn btn-start">开始</button>
          </div>
        </div>
      </div>

      <div class="task-panel">
        <div class="section-header">
          <h2 class="section-title">今日已完成</h2>
          <span class="task-count task-count--success" v-if="completedToday.length">{{ completedToday.length }} 项</span>
        </div>
        <div v-if="completedToday.length === 0" class="empty-hint empty-hint--compact">
          <div class="empty-icon">✅</div>
          <p>今天还没有完成的任务</p>
        </div>
        <div class="quick-task-list">
          <div v-for="t in completedToday" :key="t.id" class="quick-task-item quick-task-item--done">
            <span class="status-check">✓</span>
            <div class="task-info">
              <span class="task-name task-name--done">{{ t.title }}</span>
            </div>
            <span class="task-tag" :style="{ background: getProjectTagBg(t.project_id), color: getProjectColor(t.project_id) }">
              {{ getProjectName(t.project_id) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTimerStore } from '@/stores/timer'

const router = useRouter()
const projectsStore = useProjectsStore()
const timerStore = useTimerStore()

const todaySummary = ref({ total_seconds: 0, session_count: 0, activeProjects: 0, completedTasks: 0 })
const todoTasks = ref<any[]>([])
const completedToday = ref<any[]>([])

const projects = computed(() => projectsStore.projects)

function getProjectName(projectId: number): string {
  return projects.value.find(p => p.id === projectId)?.name || ''
}

function getProjectColor(projectId: number): string {
  return projects.value.find(p => p.id === projectId)?.color || 'var(--text-muted)'
}

function getProjectTagBg(projectId: number): string {
  const color = getProjectColor(projectId)
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  }
  return color.replace(')', ', 0.1)').replace('rgb(', 'rgba(')
}

onMounted(async () => {
  await projectsStore.fetchProjects()
  await timerStore.recoverSession()
  try {
    todaySummary.value = await window.api.getTodaySummary()
  } catch {}

  const activeProjects = projects.value.filter(p => p.status === 'active')
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (const p of activeProjects) {
    const tasks = await window.api.getTasksByProject(p.id)
    for (const t of tasks) {
      if (t.status === 'todo' || t.status === 'in_progress') {
        todoTasks.value.push(t)
      } else if (t.status === 'completed') {
        const updatedAt = new Date(t.updated_at)
        if (updatedAt >= todayStart) {
          completedToday.value.push(t)
        }
      }
    }
  }
})

async function startWork(task: any) {
  if (timerStore.hasActiveSession) {
    await timerStore.stopSession()
  }
  await timerStore.startSession(task.id)
  router.push('/active')
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0h'
  return (seconds / 3600).toFixed(1) + 'h'
}
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card--hero .stat-value {
  color: var(--accent);
  font-size: 22px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.stat-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 20px;
}

.stat-icon--time {
  background: var(--accent-light);
}

.stat-icon--sessions {
  background: var(--info-light);
}

.stat-icon--done {
  background: var(--success-light);
}

.stat-icon--projects {
  background: var(--warning-light);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.task-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.task-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 10px;
  border-radius: 20px;
}

.task-count--success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.empty-hint {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-muted);
}

.empty-hint--compact {
  padding: 36px 16px;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-hint p {
  font-size: 14px;
}

.quick-task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.quick-task-item:hover {
  box-shadow: var(--shadow);
  border-color: var(--accent);
  transform: translateX(2px);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.high {
  background: var(--danger);
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.3);
}

.priority-dot.medium {
  background: var(--warning);
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.3);
}

.priority-dot.low {
  background: var(--success);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.task-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.btn-start {
  background: var(--accent-light);
  color: var(--accent);
  padding: 5px 14px;
  border-radius: var(--radius-xs);
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition);
  flex-shrink: 0;
}

.btn-start:hover {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.3);
}

.status-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-task-item--done {
  cursor: default;
}

.quick-task-item--done:hover {
  border-color: var(--border);
  transform: none;
  box-shadow: var(--shadow-sm);
}

.task-name--done {
  text-decoration: line-through;
  color: var(--text-muted);
}
</style>
