import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Project {
  id: number
  name: string
  description: string
  color: string
  status: string
  created_at: string
  updated_at: string
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    try {
      projects.value = await window.api.getProjects()
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: { name: string; description: string; color: string }) {
    const plain = JSON.parse(JSON.stringify(data))
    await window.api.createProject(plain)
    await fetchProjects()
  }

  async function updateProject(id: number, data: Partial<Project>) {
    const plain = JSON.parse(JSON.stringify(data))
    await window.api.updateProject(id, plain)
    await fetchProjects()
  }

  async function deleteProject(id: number) {
    await window.api.deleteProject(id)
    await fetchProjects()
  }

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject }
})
