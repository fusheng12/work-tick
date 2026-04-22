<template>
  <div class="project-card" @click="$router.push(`/projects/${project.id}`)">
    <div class="card-header">
      <div class="color-bar" :style="{ background: project.color }"></div>
      <div class="card-header-content">
        <div class="card-top-row">
          <div class="color-dot" :style="{ background: project.color }"></div>
          <h3 class="project-name">{{ project.name }}</h3>
        </div>
        <p v-if="project.description" class="project-desc">{{ project.description }}</p>
      </div>
    </div>
    <div class="card-footer">
      <span class="project-date">{{ formatDate(project.created_at) }}</span>
      <button class="btn btn-ghost btn-sm edit-btn" @click.stop="$emit('edit', project)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        编辑
      </button>
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
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.project-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.color-bar {
  height: 3px;
  width: 100%;
  flex-shrink: 0;
}

.card-header-content {
  padding: 16px 16px 12px;
  flex: 1;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}

.project-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.project-desc {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.01);
  margin-top: auto;
}

.project-date {
  font-size: 12px;
  color: var(--text-muted);
}

.edit-btn {
  gap: 4px;
  color: var(--text-muted);
}

.edit-btn:hover {
  color: var(--accent);
  background: var(--accent-light);
}
</style>
