<template>
  <div class="dashboard">
    <h1 class="page-title">仪表盘</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ formatDuration(todaySummary.total_seconds) }}</div>
        <div class="stat-label">今日工时</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todaySummary.session_count }}</div>
        <div class="stat-label">今日工作次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todaySummary.completedTasks || 0 }}</div>
        <div class="stat-label">今日完成任务</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ projects.length }}</div>
        <div class="stat-label">总项目数</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">待办任务</h2>
      <div v-if="todoTasks.length === 0" class="empty-hint">
        <p>暂无待办任务</p>
      </div>
      <div class="quick-task-list">
        <div v-for="t in todoTasks.slice(0, 8)" :key="t.id" class="quick-task-item" @click="startWork(t)">
          <span class="priority-dot" :class="t.priority"></span>
          <span class="task-name">{{ t.title }}</span>
          <span class="task-project" :style="{ color: getProjectColor(t.project_id) }">{{ getProjectName(t.project_id) }}</span>
          <button class="btn btn-primary btn-sm">开始</button>
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

const projects = computed(() => projectsStore.projects)

function getProjectName(projectId: number): string {
  return projects.value.find(p => p.id === projectId)?.name || ''
}

function getProjectColor(projectId: number): string {
  return projects.value.find(p => p.id === projectId)?.color || 'var(--text-muted)'
}

onMounted(async () => {
  await projectsStore.fetchProjects()
  await timerStore.recoverSession()
  try {
    todaySummary.value = await window.api.getTodaySummary()
  } catch {}

  // Load todo tasks from all active projects
  const activeProjects = projects.value.filter(p => p.status === 'active')
  for (const p of activeProjects) {
    const tasks = await window.api.getTasksByProject(p.id)
    const todos = tasks.filter((t: any) => t.status === 'todo' || t.status === 'in_progress')
    todoTasks.value.push(...todos)
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
  if (!seconds) return '0分钟'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`
  return `${m}分钟`
}
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
}

.quick-task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}

.quick-task-item:hover {
  background: var(--bg-hover);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.high { background: var(--danger); }
.priority-dot.medium { background: var(--warning); }
.priority-dot.low { background: var(--success); }

.task-name {
  flex: 1;
  font-size: 14px;
}

.task-project {
  font-size: 12px;
  flex-shrink: 0;
}
</style>
