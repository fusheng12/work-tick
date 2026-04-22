<template>
  <div class="project-card" :style="{ borderColor: project.color }" @click="$router.push(`/projects/${project.id}`)">
    <div class="card-header">
      <div class="color-dot" :style="{ background: project.color }"></div>
      <h3 class="project-name">{{ project.name }}</h3>
    </div>
    <p v-if="project.description" class="project-desc">{{ project.description }}</p>
    <div class="card-footer">
      <span class="project-date">{{ formatDate(project.created_at) }}</span>
      <button class="btn btn-ghost btn-sm" @click.stop="$emit('edit', project)">编辑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/stores/projects'

defineProps<{ project: Project }>()
defineEmits<{
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
  border: 1px solid var(--border);
  border-left: 4px solid;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
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
</style>
