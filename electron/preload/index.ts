import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Projects
  getProjects: () => ipcRenderer.invoke('projects:getAll'),
  getProject: (id: number) => ipcRenderer.invoke('projects:getById', id),
  createProject: (data: { name: string; description: string; color: string }) =>
    ipcRenderer.invoke('projects:create', data),
  updateProject: (id: number, data: { name?: string; description?: string; color?: string; status?: string }) =>
    ipcRenderer.invoke('projects:update', id, data),
  deleteProject: (id: number) => ipcRenderer.invoke('projects:delete', id),

  // Tasks
  getTasksByProject: (projectId: number) => ipcRenderer.invoke('tasks:getByProject', projectId),
  getTask: (id: number) => ipcRenderer.invoke('tasks:getById', id),
  createTask: (data: { project_id: number; title: string; description?: string; priority?: string }) =>
    ipcRenderer.invoke('tasks:create', data),
  updateTask: (id: number, data: { title?: string; description?: string; status?: string; priority?: string }) =>
    ipcRenderer.invoke('tasks:update', id, data),
  deleteTask: (id: number) => ipcRenderer.invoke('tasks:delete', id),

  // Sessions
  getSessions: (projectId?: number, taskId?: number) => ipcRenderer.invoke('sessions:getAll', projectId, taskId),
  getActiveSession: () => ipcRenderer.invoke('sessions:getActive'),
  startSession: (taskId: number) => ipcRenderer.invoke('sessions:start', taskId),
  pauseSession: (id: number) => ipcRenderer.invoke('sessions:pause', id),
  resumeSession: (id: number) => ipcRenderer.invoke('sessions:resume', id),
  stopSession: (id: number, taskStatus?: string) => ipcRenderer.invoke('sessions:stop', id, taskStatus),

  // Milestones
  getMilestones: (taskId?: number, projectId?: number) =>
    ipcRenderer.invoke('milestones:getAll', taskId, projectId),
  addMilestone: (data: { taskId: number; projectId: number; content: string }) =>
    ipcRenderer.invoke('milestones:add', data),
  deleteMilestone: (id: number) => ipcRenderer.invoke('milestones:delete', id),

  // Statistics
  getDailyStats: (days: number) => ipcRenderer.invoke('stats:daily', days),
  getProjectStats: (days: number) => ipcRenderer.invoke('stats:projects', days),
  getTodaySummary: () => ipcRenderer.invoke('stats:todaySummary'),
}

contextBridge.exposeInMainWorld('api', api)
