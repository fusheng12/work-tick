import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Task {
  id: number
  project_id: number
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  async function fetchTasks(projectId: number) {
    loading.value = true
    try {
      tasks.value = await window.api.getTasksByProject(projectId)
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: { project_id: number; title: string; description?: string; priority?: string }) {
    const plain = JSON.parse(JSON.stringify(data))
    await window.api.createTask(plain)
    await fetchTasks(data.project_id)
  }

  async function updateTask(id: number, data: { title?: string; description?: string; status?: string; priority?: string }, projectId: number) {
    const plain = JSON.parse(JSON.stringify(data))
    await window.api.updateTask(id, plain)
    await fetchTasks(projectId)
  }

  async function deleteTask(id: number, projectId: number) {
    await window.api.deleteTask(id)
    await fetchTasks(projectId)
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask }
})
