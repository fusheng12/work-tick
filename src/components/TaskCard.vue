<template>
  <div class="task-card" :class="'priority-' + task.priority">
    <div class="card-main" @click="$emit('expand', task)">
      <div class="card-info">
        <div class="card-title-row">
          <span class="priority-dot" :class="task.priority"></span>
          <span class="card-title">{{ task.title }}</span>
          <span class="status-tag" :class="task.status">{{ statusLabel }}</span>
        </div>
        <div v-if="latestMilestone" class="card-latest">
          {{ latestMilestone.content }}
        </div>
      </div>
      <div class="card-meta">
        <span class="meta-date">{{ formatDate(task.created_at) }}</span>
        <div class="card-actions" @click.stop>
          <button v-if="task.status !== 'completed' && task.status !== 'in_progress'" class="action-btn start" @click="$emit('start', task)">
            开始
          </button>
          <button v-if="task.status === 'in_progress'" class="action-btn resume" @click="$emit('resume', task)">
            继续
          </button>
          <button class="action-btn danger" @click="$emit('delete', task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/stores/tasks'

const props = defineProps<{
  task: Task
  latestMilestone?: { content: string; created_at: string } | null
}>()
defineEmits<{
  start: [task: Task]
  resume: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
  expand: [task: Task]
}>()

const statusMap: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  completed: '已完成',
  shelved: '已搁置',
}

const statusLabel = statusMap[props.task.status] || props.task.status

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((today.getTime() - target.getTime()) / 86400000)
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  if (diff === 0) return `今天 ${time}`
  if (diff === 1) return `昨天 ${time}`
  if (diff < 7) return `周${weekDays[d.getDay()]} ${time}`
  if (d.getMonth() === now.getMonth()) return `${d.getMonth() + 1}月${d.getDate()}日`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>

<style scoped>
.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: box-shadow 0.15s;
}

.task-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.task-card.priority-high { border-left: 3px solid var(--danger); }
.task-card.priority-medium { border-left: 3px solid var(--warning); }
.task-card.priority-low { border-left: 3px solid var(--success); }

.card-main {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  cursor: pointer;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  flex-shrink: 0;
  white-space: nowrap;
}

.status-tag.todo { background: #eff6ff; color: #3b82f6; }
.status-tag.in_progress { background: #fef3c7; color: #d97706; }
.status-tag.completed { background: #f0fdf4; color: #16a34a; }
.status-tag.shelved { background: #f3f4f6; color: #9ca3af; }

.card-latest {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 16px;
  position: relative;
}

.card-latest::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
  transform: translateY(-50%);
}

.card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.meta-date {
  font-size: 12px;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.1s;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.action-btn.start {
  width: auto;
  padding: 0 10px;
  font-size: 12px;
  color: #fff;
  background: var(--accent);
  opacity: 1;
}

.action-btn.start:hover {
  background: var(--accent-hover);
}

.action-btn.resume {
  width: auto;
  padding: 0 10px;
  font-size: 12px;
  color: #fff;
  background: var(--warning);
  opacity: 1;
}

.action-btn.resume:hover {
  opacity: 0.85;
}

.action-btn.danger:hover {
  background: #fef2f2;
  color: var(--danger);
}
</style>
