export {}

declare global {
  interface Window {
    api: {
      // Projects
      getProjects: () => Promise<any[]>
      getProject: (id: number) => Promise<any>
      createProject: (data: { name: string; description: string; color: string }) => Promise<any>
      updateProject: (id: number, data: { name?: string; description?: string; color?: string; status?: string }) => Promise<any>
      deleteProject: (id: number) => Promise<void>

      // Tasks
      getTasksByProject: (projectId: number) => Promise<any[]>
      getTask: (id: number) => Promise<any>
      createTask: (data: { project_id: number; title: string; description?: string; priority?: string }) => Promise<any>
      updateTask: (id: number, data: { title?: string; description?: string; status?: string; priority?: string }) => Promise<any>
      deleteTask: (id: number) => Promise<void>

      // Sessions
      getSessions: (projectId?: number, taskId?: number) => Promise<any[]>
      getActiveSession: () => Promise<any | null>
      startSession: (taskId: number) => Promise<any>
      pauseSession: (id: number) => Promise<any>
      resumeSession: (id: number) => Promise<any>
      stopSession: (id: number) => Promise<any>

      // Milestones
      getMilestones: (taskId?: number, projectId?: number) => Promise<any[]>
      addMilestone: (data: { taskId: number; projectId: number; content: string }) => Promise<any>
      deleteMilestone: (id: number) => Promise<void>

      // Statistics
      getDailyStats: (days: number) => Promise<any[]>
      getProjectStats: (days: number) => Promise<any[]>
      getTodaySummary: () => Promise<any>
    }
  }
}
