<template>
  <div class="project-card" :style="{ borderColor: project.color }">
    <div class="card-header">
      <div class="color-dot" :style="{ background: project.color }"></div>
      <h3 class="project-name">{{ project.name }}</h3>
    </div>
    <p v-if="project.description" class="project-desc">{{ project.description }}</p>
    <div class="card-footer">
      <span class="project-date">{{ formatDate(project.created_at) }}</span>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" @click="$emit('start', project.id)">
          开始工作
        </button>
        <button class="btn btn-ghost btn-sm" @click="$emit('edit', project)">编辑</button>
        <button class="btn btn-ghost btn-sm" @click="$router.push(`/projects/${project.id}`)">详情</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/stores/projects'

defineProps<{ project: Project }>()
defineEmits<{
  start: [projectId: number]
  edit: [project: Project]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.project-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border-left: 4px solid;
  border: 1px solid var(--border);
  border-left: 4px solid;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
}

.project-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-date {
  font-size: 12px;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 4px;
}
</style>
