<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">⏱</span>
        <span class="logo-text">WorkTick</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📊</span>
        <span>仪表盘</span>
      </router-link>
      <router-link to="/projects" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📁</span>
        <span>项目管理</span>
      </router-link>
      <router-link to="/active" class="nav-item" exact-active-class="active">
        <span class="nav-icon">▶</span>
        <span>正在工作</span>
      </router-link>
      <router-link to="/statistics" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📈</span>
        <span>统计分析</span>
      </router-link>
    </nav>

    <div v-if="timerStore.hasActiveSession" class="sidebar-timer" @click="$router.push('/active')">
      <div class="timer-mini">
        <span class="timer-dot" :class="{ running: timerStore.isRunning, paused: timerStore.isPaused }"></span>
        <span class="timer-text">{{ formatTime(timerStore.elapsedSeconds) }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useTimerStore } from '@/stores/timer'

const timerStore = useTimerStore()

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  -webkit-app-region: drag;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.sidebar-nav {
  padding: 12px 8px;
  flex: 1;
  -webkit-app-region: no-drag;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent);
  color: #fff;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-timer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.timer-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.timer-dot.running {
  background: var(--success);
  animation: pulse 2s infinite;
}

.timer-dot.paused {
  background: var(--warning);
}

.timer-text {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
