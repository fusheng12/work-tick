<template>
  <div class="projects-page">
    <div class="page-header">
      <h1 class="page-title">项目管理</h1>
      <button class="btn btn-primary" @click="showAddForm = true">+ 新建项目</button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal">
        <h2>{{ editingProject ? '编辑项目' : '新建项目' }}</h2>
        <div class="form-group">
          <label>项目名称</label>
          <input v-model="form.name" placeholder="输入项目名称" />
        </div>
        <div class="form-group">
          <label>项目描述</label>
          <textarea v-model="form.description" placeholder="输入项目描述（可选）" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>项目颜色</label>
          <div class="color-picker">
            <button
              v-for="c in colors"
              :key="c"
              class="color-option"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
            />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" @click="cancelForm">取消</button>
          <button class="btn btn-primary" @click="saveProject" :disabled="!form.name.trim()">保存</button>
        </div>
      </div>
    </div>

    <!-- Project List -->
    <div class="projects-grid">
      <ProjectCard
        v-for="p in projects"
        :key="p.id"
        :project="p"
        @edit="editProject"
      />
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <p>还没有项目</p>
      <p class="sub">点击"新建项目"开始使用 WorkTick</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore, type Project } from '@/stores/projects'
import ProjectCard from '@/components/ProjectCard.vue'

const projectsStore = useProjectsStore()

const showAddForm = ref(false)
const editingProject = ref<Project | null>(null)

const form = ref({ name: '', description: '', color: '#4A90D9' })

const colors = [
  '#4A90D9', '#5B6ABF', '#9B59B6', '#E74C3C',
  '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#34495E', '#7F8C8D',
]

const projects = computed(() => projectsStore.projects)

onMounted(() => {
  projectsStore.fetchProjects()
})

function editProject(project: Project) {
  editingProject.value = project
  form.value = { name: project.name, description: project.description, color: project.color }
  showAddForm.value = true
}

function cancelForm() {
  showAddForm.value = false
  editingProject.value = null
  form.value = { name: '', description: '', color: '#4A90D9' }
}

async function saveProject() {
  if (!form.value.name.trim()) return
  try {
    if (editingProject.value) {
      await projectsStore.updateProject(editingProject.value.id, form.value)
    } else {
      await projectsStore.createProject(form.value)
    }
    cancelForm()
  } catch (e) {
    alert('保存失败: ' + (e instanceof Error ? e.message : e))
  }
}
</script>

<style scoped>
.projects-page {
  max-width: 1000px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

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

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid transparent;
  transition: var(--transition);
  cursor: pointer;
}

.color-option:hover {
  transform: scale(1.15);
}

.color-option.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--text-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.empty-state p:first-child {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state .sub {
  font-size: 13px;
  color: var(--border);
}
</style>
