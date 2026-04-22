<template>
  <div class="timeline">
    <div v-if="!disabled" class="timeline-input">
      <input
        v-model="newContent"
        placeholder="记录工作内容..."
        @keyup.enter="addEntry"
      />
      <button class="btn btn-primary btn-sm" @click="addEntry" :disabled="!newContent.trim()">添加</button>
    </div>
    <div class="timeline-list">
      <div v-for="entry in entries" :key="entry.id" class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-text">{{ entry.content }}</span>
          <span class="timeline-time">{{ formatTime(entry.created_at) }}</span>
        </div>
        <button v-if="!disabled" class="btn btn-ghost btn-sm timeline-delete" @click="$emit('delete', entry.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div v-if="entries.length === 0" class="timeline-empty">暂无记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  entries: { id: number; content: string; created_at: string }[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  add: [content: string]
  delete: [id: number]
}>()

const newContent = ref('')

function addEntry() {
  if (!newContent.value.trim()) return
  emit('add', newContent.value.trim())
  newContent.value = ''
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((today.getTime() - target.getTime()) / 86400000)
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  if (diff === 0) return `今天 ${time}`
  if (diff === 1) return `昨天 ${time}`
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-input {
  display: flex;
  gap: 8px;
}

.timeline-input input {
  flex: 1;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border);
  border-radius: 1px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  position: relative;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--accent);
  flex-shrink: 0;
  margin-top: 2px;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.timeline-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

.timeline-time {
  font-size: 11px;
  color: var(--text-muted);
}

.timeline-delete {
  opacity: 0;
  transition: var(--transition);
  flex-shrink: 0;
  padding: 4px;
  border-radius: var(--radius-xs);
}

.timeline-item:hover .timeline-delete {
  opacity: 1;
}

.timeline-delete:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.timeline-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 16px;
}
</style>
