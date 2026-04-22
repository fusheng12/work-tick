<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon-wrap">
          <span class="logo-icon">⏱</span>
        </div>
        <span class="logo-text">WorkTick</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group-label">主菜单</div>
      <router-link to="/" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📊</span>
        <span class="nav-text">仪表盘</span>
      </router-link>
      <router-link to="/projects" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📁</span>
        <span class="nav-text">项目管理</span>
      </router-link>
      <router-link to="/active" class="nav-item" exact-active-class="active">
        <span class="nav-icon">▶</span>
        <span class="nav-text">正在工作</span>
      </router-link>
      <router-link to="/statistics" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📈</span>
        <span class="nav-text">统计分析</span>
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
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  -webkit-app-region: drag;
  position: relative;
  z-index: 10;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.sidebar-header {
  padding: 24px 20px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.4);
}

.logo-icon {
  font-size: 18px;
  filter: brightness(10);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  padding: 8px 12px;
  flex: 1;
  -webkit-app-region: no-drag;
}

.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  padding: 12px 12px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--sidebar-text);
  text-decoration: none;
  transition: var(--transition);
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sidebar-text-hover);
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: #fff;
}

.nav-item.active .nav-icon {
  filter: none;
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-timer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.timer-mini {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.timer-dot.running {
  background: var(--success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulse 2s infinite;
}

.timer-dot.paused {
  background: var(--warning);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.timer-text {
  font-family: 'SF Mono', 'Consolas', 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.05em;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
