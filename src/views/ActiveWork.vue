<template>
  <div class="active-work">
    <h1 class="page-title">正在工作</h1>

    <div v-if="!timerStore.hasActiveSession" class="no-session">
      <p>当前没有进行中的工作</p>
      <p class="sub">去 <router-link to="/projects">项目列表</router-link> 选择一个任务开始</p>
    </div>

    <div v-else class="active-content">
      <div v-if="currentTask" class="task-badge">
        <span class="task-title">{{ currentTask.title }}</span>
        <span class="task-project" :style="{ color: currentProject?.color }">{{ currentProject?.name }}</span>
      </div>

      <TimerDisplay :seconds="timerStore.elapsedSeconds" :label="timerLabel" />

      <div class="timer-actions">
        <template v-if="timerStore.isRunning">
          <button class="btn btn-warning btn-lg" @click="timerStore.pauseSession()">⏸ 暂停</button>
          <button class="btn btn-danger btn-lg" @click="showStopDialog = true">⏹ 停止</button>
        </template>
        <template v-else-if="timerStore.isPaused">
          <button class="btn btn-success btn-lg" @click="timerStore.resumeSession()">▶ 继续</button>
          <button class="btn btn-danger btn-lg" @click="showStopDialog = true">⏹ 停止</button>
        </template>
      </div>

      <div class="timeline-section">
        <h3 class="section-title">工作记录</h3>
        <TaskTimeline
          :entries="milestones"
          @add="addMilestone"
          @delete="deleteMilestone"
        />
      </div>
    </div>

    <!-- Stop dialog with status selection -->
    <div v-if="showStopDialog" class="modal-overlay" @click.self="showStopDialog = false">
      <div class="modal">
        <h2>停止工作</h2>
        <p class="modal-desc">请选择任务状态：</p>
        <div class="status-options">
          <button class="status-option completed" @click="stopWork('completed')">
            <span class="status-icon">✓</span>
            <span class="status-label">已完成</span>
            <span class="status-hint">任务已完成</span>
          </button>
          <button class="status-option in_progress" @click="stopWork('in_progress')">
            <span class="status-icon">⋯</span>
            <span class="status-label">进行中</span>
            <span class="status-hint">稍后继续</span>
          </button>
          <button class="status-option shelved" @click="stopWork('shelved')">
            <span class="status-icon">⏸</span>
            <span class="status-label">已搁置</span>
            <span class="status-hint">暂时搁置</span>
          </button>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" @click="showStopDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timer'
import { useProjectsStore } from '@/stores/projects'
import TimerDisplay from '@/components/TimerDisplay.vue'
import TaskTimeline from '@/components/TaskTimeline.vue'

const router = useRouter()
const timerStore = useTimerStore()
const projectsStore = useProjectsStore()

const showStopDialog = ref(false)
const milestones = ref<{ id: number; content: string; created_at: string }[]>([])
const currentTask = ref<any>(null)

const currentProject = computed(() =>
  projectsStore.projects.find(p => p.id === timerStore.activeSession?.project_id)
)

const timerLabel = computed(() => {
  if (timerStore.isRunning) return '工作中...'
  if (timerStore.isPaused) return '已暂停'
  return ''
})

onMounted(async () => {
  await projectsStore.fetchProjects()
  await timerStore.recoverSession()
  if (timerStore.activeSession?.task_id) {
    currentTask.value = await window.api.getTask(timerStore.activeSession.task_id)
    await loadMilestones()
  }
})

async function loadMilestones() {
  if (!timerStore.activeSession?.task_id) return
  milestones.value = await window.api.getMilestones(timerStore.activeSession.task_id)
}

async function addMilestone(content: string) {
  if (!timerStore.activeSession?.task_id) return
  await window.api.addMilestone({
    taskId: timerStore.activeSession.task_id,
    projectId: timerStore.activeSession.project_id,
    content,
  })
  await loadMilestones()
}

async function deleteMilestone(id: number) {
  await window.api.deleteMilestone(id)
  await loadMilestones()
}

async function stopWork(status: string) {
  const taskId = timerStore.activeSession?.task_id
  const projectId = timerStore.activeSession?.project_id
  await timerStore.stopSession()
  if (taskId && projectId) {
    await window.api.updateTask(taskId, { status })
  }
  showStopDialog.value = false
  milestones.value = []
  currentTask.value = null
  router.push('/projects')
}
</script>

<style scoped>
.active-work {
  max-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.no-session {
  text-align: center;
  padding: 64px 0;
  color: var(--text-muted);
}

.no-session .sub {
  font-size: 13px;
  margin-top: 8px;
}

.no-session a {
  color: var(--accent);
}

.active-content {
  text-align: center;
}

.task-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 32px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
}

.task-project {
  font-size: 13px;
  color: var(--text-secondary);
}

.timer-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 40px;
}

.btn-lg {
  padding: 12px 32px;
  font-size: 16px;
  border-radius: var(--radius);
}

.timeline-section {
  text-align: left;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: 400px;
  max-width: 90vw;
}

.modal h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.modal-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.status-option:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.status-option.completed:hover {
  border-color: #22c55e;
}

.status-option.in_progress:hover {
  border-color: #f59e0b;
}

.status-option.shelved:hover {
  border-color: var(--text-muted);
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.completed .status-icon {
  background: #f0fdf4;
  color: #22c55e;
}

.in_progress .status-icon {
  background: #fffbeb;
  color: #f59e0b;
}

.shelved .status-icon {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.status-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
