<template>
  <div class="session-history">
    <div v-if="sessions.length === 0" class="empty">暂无工作记录</div>
    <div v-for="s in sessions" :key="s.id" class="session-item">
      <div class="session-info">
        <span class="session-date">{{ formatDate(s.start_time) }}</span>
        <span class="session-time">
          {{ formatTimeOfDay(s.start_time) }}
          <template v-if="s.end_time"> — {{ formatTimeOfDay(s.end_time) }}</template>
        </span>
      </div>
      <div class="session-duration">{{ formatDuration(s.duration) }}</div>
      <span class="session-status" :class="s.status">{{ statusLabel(s.status) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessions: {
    id: number
    start_time: string
    end_time: string | null
    duration: number
    status: string
  }[]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatTimeOfDay(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m}分钟`
  return `${m}分钟`
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = { completed: '已完成', running: '进行中', paused: '已暂停' }
  return labels[status] || status
}
</script>

<style scoped>
.session-history {
  width: 100%;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 32px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.session-item:hover {
  background: var(--bg-hover);
}

.session-info {
  flex: 1;
}

.session-date {
  font-weight: 500;
  margin-right: 8px;
}

.session-time {
  color: var(--text-secondary);
  font-size: 13px;
}

.session-duration {
  font-family: 'Consolas', monospace;
  font-weight: 600;
  color: var(--accent);
}

.session-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-secondary);
}

.session-status.completed {
  color: var(--success);
}

.session-status.running {
  color: var(--warning);
}

.session-status.paused {
  color: var(--text-muted);
}
</style>
