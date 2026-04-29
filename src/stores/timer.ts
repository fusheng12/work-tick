import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Session {
  id: number
  project_id: number
  task_id: number | null
  start_time: string
  end_time: string | null
  duration: number
  status: string
  created_at: string
}

export const useTimerStore = defineStore('timer', () => {
  const activeSession = ref<Session | null>(null)
  const elapsedSeconds = ref(0)
  const isRunning = ref(false)
  const isPaused = ref(false)
  let tickInterval: ReturnType<typeof setInterval> | null = null
  // Track the reference point for accurate elapsed time calculation
  let refTimestamp = 0
  let refElapsed = 0

  const hasActiveSession = computed(() => activeSession.value !== null)

  function startTick() {
    stopTick()
    refTimestamp = Date.now()
    refElapsed = elapsedSeconds.value
    tickInterval = setInterval(() => {
      if (isRunning.value) {
        elapsedSeconds.value = refElapsed + Math.floor((Date.now() - refTimestamp) / 1000)
      }
    }, 250)
  }

  function stopTick() {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
    }
  }

  function syncElapsed() {
    if (isRunning.value) {
      elapsedSeconds.value = refElapsed + Math.floor((Date.now() - refTimestamp) / 1000)
    }
  }

  async function recoverSession() {
    const session = await window.api.getActiveSession()
    if (session) {
      activeSession.value = session
      if (session.status === 'running') {
        isRunning.value = true
        isPaused.value = false
        const elapsed = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000)
        elapsedSeconds.value = session.duration + elapsed
        startTick()
      } else if (session.status === 'paused') {
        isRunning.value = false
        isPaused.value = true
        elapsedSeconds.value = session.duration
      }
    }
  }

  async function startSession(taskId: number) {
    const session = await window.api.startSession(taskId)
    activeSession.value = session
    isRunning.value = true
    isPaused.value = false
    elapsedSeconds.value = 0
    startTick()
  }

  async function pauseSession() {
    if (!activeSession.value) return
    syncElapsed()
    stopTick()
    const session = await window.api.pauseSession(activeSession.value.id)
    activeSession.value = session
    isRunning.value = false
    isPaused.value = true
    elapsedSeconds.value = session.duration
  }

  async function resumeSession() {
    if (!activeSession.value) return
    const session = await window.api.resumeSession(activeSession.value.id)
    activeSession.value = session
    isRunning.value = true
    isPaused.value = false
    elapsedSeconds.value = session.duration
    startTick()
  }

  async function stopSession(taskStatus?: string) {
    if (!activeSession.value) return
    syncElapsed()
    stopTick()
    await window.api.stopSession(activeSession.value.id, taskStatus)
    activeSession.value = null
    isRunning.value = false
    isPaused.value = false
    elapsedSeconds.value = 0
  }

  return {
    activeSession,
    elapsedSeconds,
    isRunning,
    isPaused,
    hasActiveSession,
    recoverSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
  }
})
