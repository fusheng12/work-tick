<template>
  <div class="project-detail">
    <div class="detail-header">
      <button class="btn btn-ghost" @click="$router.push('/projects')">← 返回</button>
      <div v-if="project" class="header-info">
        <div class="color-dot" :style="{ background: project.color }"></div>
        <h1>{{ project.name }}</h1>
        <span v-if="project.description" class="header-desc">{{ project.description }}</span>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="editProject">编辑项目</button>
        <button class="btn btn-danger btn-sm" @click="showDeleteConfirm = true">删除项目</button>
      </div>
    </div>

    <div v-if="project" class="detail-content">
      <!-- Task Filters -->
      <div class="task-toolbar">
        <button class="btn btn-primary" @click="openAddTask">+ 新建任务</button>
        <div class="task-filters">
          <button
            v-for="f in filters"
            :key="f.value"
            class="btn btn-sm"
            :class="activeFilter === f.value ? 'btn-primary' : 'btn-ghost'"
            @click="activeFilter = f.value"
          >
            {{ f.label }}<span v-if="f.count !== undefined" class="filter-count">{{ f.count }}</span>
          </button>
        </div>
      </div>

      <!-- Main: left task list + right detail -->
      <div class="split-view">
        <!-- Left: Task List -->
        <div class="split-left">
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :latest-milestone="taskLatestMap[task.id] || null"
            :class="{ 'card-active': selectedTask?.id === task.id }"
            @start="startWork"
            @resume="resumeWork"
            @edit="openEditTask"
            @delete="confirmDeleteTask"
            @expand="openTaskDetail"
          />
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无任务</p>
            <p class="sub">点击"新建任务"开始管理</p>
          </div>
        </div>

        <!-- Right: Task Detail -->
        <div v-if="selectedTask" class="split-right">
          <div class="detail-panel">
            <div class="panel-header">
              <div class="panel-badges">
                <span class="status-badge" :class="selectedTask.status">{{ statusMap[selectedTask.status] }}</span>
                <span class="priority-badge" :class="selectedTask.priority">{{ priorityMap[selectedTask.priority] }}</span>
              </div>
              <h3>{{ selectedTask.title }}</h3>
            </div>

            <div v-if="selectedTask.description" class="panel-desc">{{ selectedTask.description }}</div>

            <!-- Timeline -->
            <div class="panel-section">
              <h4>工作记录</h4>
              <TaskTimeline
                :entries="taskMilestones"
                :disabled="!isCurrentTaskActive"
                @add="addMilestone"
                @delete="deleteMilestone"
              />
            </div>

            <!-- Session History -->
            <div class="panel-section">
              <h4>计时记录</h4>
              <div v-if="taskSessions.length === 0" class="panel-empty">暂无计时记录</div>
              <div v-for="s in taskSessions" :key="s.id" class="session-item">
                <span class="session-time">{{ formatSessionTime(s.start_time) }}</span>
                <span v-if="s.end_time" class="session-dash">→</span>
                <span v-if="s.end_time" class="session-time">{{ formatSessionTime(s.end_time) }}</span>
                <span class="session-duration">{{ formatDuration(s.duration) }}</span>
                <span class="session-status" :class="s.status">{{ sessionStatusMap[s.status] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right placeholder when no task selected -->
        <div v-else class="split-right split-empty">
          <div class="empty-placeholder">
            <div class="empty-placeholder-icon">📋</div>
            <p>点击任务查看详情</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showTaskForm" class="modal-overlay" @click.self="showTaskForm = false">
      <div class="modal">
        <h2>{{ editingTask ? '编辑任务' : '新建任务' }}</h2>
        <div class="form-group">
          <label>任务标题</label>
          <input v-model="taskForm.title" placeholder="输入任务标题" />
        </div>
        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="taskForm.description" placeholder="输入任务描述（可选）" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>优先级</label>
          <div class="priority-picker">
            <button
              v-for="p in priorities"
              :key="p.value"
              class="priority-option"
              :class="[p.value, { active: taskForm.priority === p.value }]"
              @click="taskForm.priority = p.value"
            >{{ p.label }}</button>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" @click="cancelTaskForm">取消</button>
          <button class="btn btn-primary" @click="saveTask" :disabled="!taskForm.title.trim()">保存</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal modal-sm">
        <h2>确认删除</h2>
        <p class="modal-desc">删除项目将同时删除所有相关任务和记录，此操作不可恢复。</p>
        <div class="form-actions">
          <button class="btn btn-ghost" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="deleteProject">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore, type Task } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import TaskCard from '@/components/TaskCard.vue'
import TaskTimeline from '@/components/TaskTimeline.vue'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const project = ref<any>(null)
const selectedTask = ref<Task | null>(null)
const activeFilter = ref('all')
const showTaskForm = ref(false)
const editingTask = ref<Task | null>(null)
const showDeleteConfirm = ref(false)

const taskForm = ref({ title: '', description: '', priority: 'medium' })
const taskMilestones = ref<{ id: number; content: string; created_at: string }[]>([])
const taskSessions = ref<any[]>([])
const taskLatestMap = ref<Record<number, { content: string; created_at: string }>>({})

const statusMap: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  completed: '已完成',
  shelved: '已搁置',
}

const priorityMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const sessionStatusMap: Record<string, string> = {
  running: '运行中',
  paused: '已暂停',
  completed: '已完成',
}

const priorities = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
]

const filters = computed(() => {
  const tasks = tasksStore.tasks
  return [
    { label: '全部', value: 'all', count: tasks.length },
    { label: '待办', value: 'todo', count: tasks.filter(t => t.status === 'todo').length },
    { label: '进行中', value: 'in_progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { label: '已完成', value: 'completed', count: tasks.filter(t => t.status === 'completed').length },
    { label: '已搁置', value: 'shelved', count: tasks.filter(t => t.status === 'shelved').length },
  ]
})

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasksStore.tasks
  return tasksStore.tasks.filter(t => t.status === activeFilter.value)
})

const projectId = computed(() => Number(route.params.id))

const isCurrentTaskActive = computed(() => {
  if (!selectedTask.value || !timerStore.activeSession) return false
  return timerStore.activeSession.task_id === selectedTask.value.id
})

onMounted(async () => {
  await projectsStore.fetchProjects()
  project.value = projectsStore.projects.find(p => p.id === projectId.value)
  await tasksStore.fetchTasks(projectId.value)
  await timerStore.recoverSession()
  // Load latest milestone for each task
  for (const t of tasksStore.tasks) {
    const ms = await window.api.getMilestones(t.id)
    if (ms.length > 0) {
      taskLatestMap.value[t.id] = ms[0]
    }
  }
})

watch(selectedTask, async (task) => {
  if (task) {
    taskMilestones.value = await window.api.getMilestones(task.id)
    taskSessions.value = await window.api.getSessions(undefined, task.id)
  }
})

function editProject() {
  // TODO: open project edit form
}

async function deleteProject() {
  await projectsStore.deleteProject(project.value.id)
  router.push('/projects')
}

function openAddTask() {
  editingTask.value = null
  taskForm.value = { title: '', description: '', priority: 'medium' }
  showTaskForm.value = true
}

function openEditTask(task: Task) {
  editingTask.value = task
  taskForm.value = { title: task.title, description: task.description, priority: task.priority }
  showTaskForm.value = true
}

function cancelTaskForm() {
  showTaskForm.value = false
  editingTask.value = null
}

async function saveTask() {
  if (!taskForm.value.title.trim()) return
  if (editingTask.value) {
    await tasksStore.updateTask(editingTask.value.id, taskForm.value, projectId.value)
  } else {
    await tasksStore.createTask({ project_id: projectId.value, ...taskForm.value })
  }
  cancelTaskForm()
}

async function confirmDeleteTask(task: Task) {
  await tasksStore.deleteTask(task.id, projectId.value)
  if (selectedTask.value?.id === task.id) {
    selectedTask.value = null
  }
}

function openTaskDetail(task: Task) {
  selectedTask.value = task
}

async function startWork(task: Task) {
  if (timerStore.hasActiveSession) {
    await timerStore.stopSession()
  }
  await tasksStore.updateTask(task.id, { status: 'in_progress' }, projectId.value)
  await timerStore.startSession(task.id)
  router.push('/active')
}

async function resumeWork(task: Task) {
  if (timerStore.hasActiveSession) {
    await timerStore.stopSession()
  }
  await tasksStore.updateTask(task.id, { status: 'in_progress' }, projectId.value)
  await timerStore.startSession(task.id)
  router.push('/active')
}

async function addMilestone(content: string) {
  if (!selectedTask.value) return
  await window.api.addMilestone({
    taskId: selectedTask.value.id,
    projectId: projectId.value,
    content,
  })
  taskMilestones.value = await window.api.getMilestones(selectedTask.value.id)
}

async function deleteMilestone(id: number) {
  await window.api.deleteMilestone(id)
  if (selectedTask.value) {
    taskMilestones.value = await window.api.getMilestones(selectedTask.value.id)
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`
  return `${m}分钟`
}

function formatSessionTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.project-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.header-info h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.header-desc {
  color: var(--text-muted);
  font-size: 13px;
  background: var(--bg-hover);
  padding: 2px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}

.task-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.task-filters {
  display: flex;
  gap: 4px;
}

.filter-count {
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.7;
}

/* Split View */
.split-view {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
}

.split-left {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 16px;
  border-right: 1px solid var(--border);
  margin-right: 16px;
}

.split-left::-webkit-scrollbar {
  width: 4px;
}

.split-left::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.split-right {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.split-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius);
}

.empty-placeholder {
  text-align: center;
  color: var(--text-muted);
}

.empty-placeholder-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-placeholder p {
  font-size: 14px;
}

.card-active {
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
  box-shadow: var(--shadow) !important;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.empty-state .empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
}

.empty-state .sub {
  font-size: 13px;
  margin-top: 4px;
  color: var(--border);
}

/* Detail Panel */
.detail-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.panel-badges {
  display: flex;
  gap: 6px;
}

.status-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.status-badge.todo { background: var(--accent-light); color: var(--accent); }
.status-badge.in_progress { background: var(--warning-light); color: #d97706; }
.status-badge.completed { background: var(--success-light); color: var(--success); }
.status-badge.shelved { background: rgba(0, 0, 0, 0.04); color: var(--text-muted); }

.priority-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.priority-badge.high { background: var(--danger-light); color: var(--danger); }
.priority-badge.medium { background: var(--warning-light); color: #d97706; }
.priority-badge.low { background: var(--success-light); color: var(--success); }

.panel-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.panel-empty {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 16px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 13px;
  border-radius: var(--radius-xs);
  transition: background 0.15s;
}

.session-item:hover {
  background: var(--bg-hover);
}

.session-time {
  color: var(--text-primary);
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
}

.session-dash {
  color: var(--text-muted);
  font-size: 12px;
}

.session-duration {
  color: var(--accent);
  font-weight: 600;
  margin-left: auto;
  font-size: 13px;
}

.session-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
  background: var(--bg-hover);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.session-status.completed {
  background: var(--success-light);
  color: var(--success);
}

.session-status.running {
  background: var(--accent-light);
  color: var(--accent);
}

.session-status.paused {
  background: var(--warning-light);
  color: #d97706;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 28px;
  width: 440px;
  max-width: 90vw;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-sm {
  width: 400px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal h2 {
  font-size: 18px;
  margin-bottom: 24px;
  font-weight: 600;
}

.modal-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group textarea {
  resize: vertical;
}

.priority-picker {
  display: flex;
  gap: 8px;
}

.priority-option {
  padding: 7px 18px;
  border-radius: var(--radius-xs);
  border: 1.5px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}

.priority-option.high.active {
  background: var(--danger-light);
  color: var(--danger);
  border-color: var(--danger);
}

.priority-option.medium.active {
  background: var(--warning-light);
  color: #d97706;
  border-color: var(--warning);
}

.priority-option.low.active {
  background: var(--success-light);
  color: var(--success);
  border-color: var(--success);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
