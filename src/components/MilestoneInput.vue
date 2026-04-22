<template>
  <div class="milestone-input">
    <div class="input-row">
      <input
        v-model="content"
        placeholder="输入里程碑内容..."
        @keydown.enter="addMilestone"
      />
      <button class="btn btn-primary" @click="addMilestone" :disabled="!content.trim()">添加</button>
    </div>
    <div v-if="milestones.length" class="milestones-list">
      <div v-for="m in milestones" :key="m.id" class="milestone-item">
        <span class="milestone-marker">◆</span>
        <span class="milestone-content">{{ m.content }}</span>
        <span class="milestone-time">{{ formatTime(m.created_at) }}</span>
        <button class="btn btn-ghost btn-sm" @click="$emit('delete', m.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  milestones: { id: number; content: string; created_at: string }[]
}>()

const emit = defineEmits<{
  add: [content: string]
  delete: [id: number]
}>()

const content = ref('')

function addMilestone() {
  if (!content.value.trim()) return
  emit('add', content.value.trim())
  content.value = ''
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.milestone-input {
  width: 100%;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row input {
  flex: 1;
}

.milestones-list {
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
}

.milestone-marker {
  color: var(--accent);
  font-size: 10px;
  flex-shrink: 0;
}

.milestone-content {
  flex: 1;
  font-size: 13px;
}

.milestone-time {
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
}
</style>
